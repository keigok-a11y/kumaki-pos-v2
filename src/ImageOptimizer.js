import React, { useState, useRef, useEffect, useCallback } from 'react';
import { UploadCloud, Download, Image as ImageIcon, Settings, RefreshCw } from 'lucide-react';

export default function ImageOptimizer() {
  const [originalImage, setOriginalImage] = useState(null);
  const [originalFile, setOriginalFile] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [processedSize, setProcessedSize] = useState(0);

  // 変換設定
  const [settings, setSettings] = useState({
    maxWidth: 800,
    quality: 0.7,
    applyPosFilter: true,
  });

  // スライダー操作のたびに重い処理が走らないよう、300ms デバウンスをかけた設定
  const [debouncedSettings, setDebouncedSettings] = useState(settings);

  const canvasRef = useRef(null);
  const decodedImgRef = useRef(null);       // デコード済み画像をキャッシュ
  const prevOriginalImageRef = useRef(null); // 前回の画像 src を記憶
  const debounceTimer = useRef(null);

  // ファイルが選択された時の処理
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setOriginalFile(file);
    const reader = new FileReader();
    reader.onload = (event) => setOriginalImage(event.target.result);
    reader.readAsDataURL(file);
  };

  // 設定変更：UI はすぐ反映、重い描画処理は 300ms 待機
  const handleSettingChange = useCallback((newSettings) => {
    setSettings(newSettings);
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSettings(newSettings);
    }, 300);
  }, []);

  // 【修正①】RGB クランプを追加：コントラスト強調後に 0〜255 の範囲を保証
  // 【修正②】画像デコードをキャッシュ：設定変更時は再デコードをスキップ
  const processImage = useCallback(
    (img, currentSettings) => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      // 縦横比を保ったまま新しいサイズを計算
      let newWidth = img.width;
      let newHeight = img.height;
      if (newWidth > currentSettings.maxWidth) {
        newHeight = Math.round((currentSettings.maxWidth / newWidth) * newHeight);
        newWidth = currentSettings.maxWidth;
      }

      canvas.width = newWidth;
      canvas.height = newHeight;
      ctx.drawImage(img, 0, 0, newWidth, newHeight);

      // 【実験室】POS特化フィルター（コントラストと彩度の強調）
      if (currentSettings.applyPosFilter) {
        const imageData = ctx.getImageData(0, 0, newWidth, newHeight);
        const data = imageData.data;
        const contrast = 20;
        const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

        for (let i = 0; i < data.length; i += 4) {
          // 【修正①】クランプで白飛び・黒潰れを防止
          data[i]     = Math.min(255, Math.max(0, factor * (data[i]     - 128) + 128)); // R
          data[i + 1] = Math.min(255, Math.max(0, factor * (data[i + 1] - 128) + 128)); // G
          data[i + 2] = Math.min(255, Math.max(0, factor * (data[i + 2] - 128) + 128)); // B
        }
        ctx.putImageData(imageData, 0, 0);
      }

      // JPEG として書き出し（POS端末で最もエラーが起きにくい形式）
      const dataUrl = canvas.toDataURL('image/jpeg', currentSettings.quality);
      setProcessedImage(dataUrl);

      // 容量を計算（Base64 文字列からおよそのバイト数を計算）
      const base64Length = dataUrl.length - (dataUrl.indexOf(',') + 1);
      const padding =
        dataUrl.charAt(dataUrl.length - 2) === '='
          ? 2
          : dataUrl.charAt(dataUrl.length - 1) === '='
          ? 1
          : 0;
      setProcessedSize(base64Length * 0.75 - padding);
    },
    [] // canvas は ref なので deps 不要
  );

  // 【修正②】originalImage が変わった時だけデコード、設定変更時はキャッシュを再利用
  useEffect(() => {
    if (!originalImage) return;

    const run = (img) => processImage(img, debouncedSettings);

    // 同じ画像なら再デコードをスキップ
    if (
      decodedImgRef.current &&
      prevOriginalImageRef.current === originalImage
    ) {
      run(decodedImgRef.current);
      return;
    }

    // 新しい画像 → デコードしてキャッシュ
    prevOriginalImageRef.current = originalImage;
    const img = new Image();
    img.onload = () => {
      decodedImgRef.current = img;
      run(img);
    };
    img.src = originalImage;
  }, [originalImage, debouncedSettings, processImage]);

  // 【修正③】バイト数を KB に変換（冗長な変数を削除）
  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    return (bytes / 1024).toFixed(1) + ' KB';
  };

  // 【修正④】<a> 要素を DOM に追加・削除して確実にダウンロード
  //          originalFile の null チェックも追加
  const handleDownload = () => {
    if (!processedImage || !originalFile) return;
    const baseName = originalFile.name.split('.')[0] ?? 'image';
    const link = document.createElement('a');
    link.download = `pos_${baseName}.jpg`;
    link.href = processedImage;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans text-gray-800">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* ヘッダー */}
        <div className="bg-slate-800 p-4 text-white flex items-center gap-3">
          <RefreshCw className="w-6 h-6 text-blue-400" />
          <h1 className="text-xl font-bold">POS専用 画像軽量化ビルダー</h1>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* 左側：設定・アップロードエリア */}
            <div className="md:col-span-1 space-y-6">
              {/* アップロードボタン */}
              <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <UploadCloud className="w-10 h-10 mx-auto text-gray-400 mb-2" />
                <p className="text-sm font-medium text-gray-700">画像を選択</p>
                <p className="text-xs text-gray-500 mt-1">またはドラッグ＆ドロップ</p>
              </div>

              {/* 設定パネル */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2 mb-2">
                  <Settings className="w-4 h-4 text-slate-500" />
                  <h2 className="text-sm font-bold text-slate-700">変換設定</h2>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    横幅の最大サイズ (px)
                  </label>
                  <input
                    type="number"
                    value={settings.maxWidth}
                    onChange={(e) =>
                      handleSettingChange({ ...settings, maxWidth: Number(e.target.value) })
                    }
                    className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">
                    ※POS端末の画面に合わせて調整してください
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    画質・圧縮率: {Math.round(settings.quality * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.1"
                    value={settings.quality}
                    onChange={(e) =>
                      handleSettingChange({ ...settings, quality: Number(e.target.value) })
                    }
                    className="w-full"
                  />
                  <div className="flex justify-between text-[10px] text-gray-500">
                    <span>容量小 (粗い)</span>
                    <span>容量大 (綺麗)</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <label className="flex items-start gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={settings.applyPosFilter}
                      onChange={(e) =>
                        handleSettingChange({ ...settings, applyPosFilter: e.target.checked })
                      }
                      className="mt-1"
                    />
                    <div>
                      <span className="block text-xs font-bold text-blue-700 group-hover:text-blue-800">
                        【実験室】POS特化フィルター
                      </span>
                      <span className="block text-[10px] text-gray-500 mt-0.5 leading-tight">
                        安価な液晶画面でも美味しそうに見えるよう、自動でコントラストを強調します。
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* ダウンロードボタン */}
              <button
                onClick={handleDownload}
                disabled={!processedImage}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-bold transition-all ${
                  processedImage
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Download className="w-5 h-5" />
                変換した画像を保存
              </button>
            </div>

            {/* 右側：プレビューエリア */}
            <div className="md:col-span-2 space-y-4">
              {!originalImage ? (
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-lg bg-gray-50 text-gray-400">
                  <ImageIcon className="w-16 h-16 mb-4 text-gray-300" />
                  <p>左側のエリアに画像をアップロードしてください</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* 変換後の画像プレビュー */}
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                    <div className="bg-green-50 px-4 py-2 border-b border-green-100 flex justify-between items-center">
                      <span className="text-sm font-bold text-green-800">
                        変換後のプレビュー (POS用)
                      </span>
                      <span className="text-xs font-bold bg-green-200 text-green-800 px-2 py-1 rounded-full">
                        {formatBytes(processedSize)}
                      </span>
                    </div>
                    <div className="p-4 flex justify-center bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMUlEQVQ4T2NkYGAQYcAP3uCTZhw1gGGYhAGBZIA/nYBwDqHwRyMIdwM1Y4oZRo0gMAgAxNQKwW5p5GMAAAAASUVORK5CYII=')]">
                      <img
                        src={processedImage}
                        alt="Processed Preview"
                        className="max-h-[300px] object-contain shadow-md"
                      />
                    </div>
                  </div>

                  {/* 元画像のプレビュー */}
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm opacity-60 hover:opacity-100 transition-opacity">
                    <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
                      <span className="text-sm font-bold text-gray-600">元の画像</span>
                      <span className="text-xs text-gray-500">
                        {originalFile && formatBytes(originalFile.size)}
                      </span>
                    </div>
                    <div className="p-4 flex justify-center">
                      <img
                        src={originalImage}
                        alt="Original Preview"
                        className="max-h-[150px] object-contain"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 隠しキャンバス（画像処理用） */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
