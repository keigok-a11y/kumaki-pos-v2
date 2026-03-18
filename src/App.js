import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { initializeApp } from "firebase/app";
import {
  getFirestore, collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc, query, orderBy
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  Utensils, ShoppingCart, Trash, CheckCircle, Plus, Minus, X,
  ChevronLeft, Settings, Monitor, Smartphone, Link, Share2,
  UserPlus, Pencil, Receipt, HelpCircle, Languages, Image as ImageIcon, History, Clock, FileText
} from "lucide-react";

/* ===========================================
   FIREBASE CONFIGURATION
   =========================================== */
const firebaseConfig = {
  apiKey: "AIzaSyB25_sp1ACQ4t6zoHY5MzqE0mVU3Tb4FnE",
  authDomain: "kumaki-tacos-pos.firebaseapp.com",
  projectId: "kumaki-tacos-pos",
  storageBucket: "kumaki-tacos-pos.firebasestorage.app",
  messagingSenderId: "695489294697",
  appId: "1:695489294697:web:ca8359063a4bdba5f2cdf8",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

/* ===========================================
   CONSTANTS & INITIAL DATA
   =========================================== */
const INITIAL_MENU_DATA = [
  { id: "Z6SForpMTyQkWXGRjPtE", category: "１、アルコール", price: 790, name: "コロナ", nameEn: "Corona Beer", isSoldOut: false, options: [], optionsEn: [] },
  { id: "hXQsSVsPyV33BZR7yY4d", price: 750, name: "ハイネケン", nameEn: "Heineken", category: "１、アルコール", options: [], optionsEn: [], isSoldOut: false },
  { id: "zwYIoh8KOR9mIpiPSqA2", name: "ハイボール（角）", nameEn: "Highball (Suntory Kaku)", isSoldOut: false, options: [], optionsEn: [], price: 650, category: "１、アルコール" },
  { id: "olkrbdbBbQZkJFNUVK93", price: 700, category: "１、アルコール", isSoldOut: false, name: "ハウスワイン赤", nameEn: "House Wine (Red)", options: [], optionsEn: [] },
  { id: "bFZLWaZYwPP8BlH2kiG8", options: [], optionsEn: [], name: "ハウスワイン白", nameEn: "House Wine (White)", price: 700, isSoldOut: false, category: "１、アルコール" },
  { id: "2bpnlxhajlb3xCGTCUBT", isSoldOut: false, category: "２、テキーラ", name: "A,(1800)セン・オチョシエント・アネホ・レゼルバ(熟成）", nameEn: "1800 Añejo Reserva", price: 1200, options: ["ハイボール", "ハーフロック", "ロック", "ストレート", "トニック割：+50"], optionsEn: ["Highball", "Half Rock", "On the Rocks", "Straight", "with Tonic: +50"] },
  { id: "P0edpG0zoS9rDtCLe9bE", category: "２、テキーラ", price: 1500, name: "A,ドンフリオ・アニェホ（熟成）", nameEn: "Don Julio Añejo", isSoldOut: false, options: ["ハイボール", "ハーフロック", "ロック", "ストレート", "トニック割：+50"], optionsEn: ["Highball", "Half Rock", "On the Rocks", "Straight", "with Tonic: +50"] },
  { id: "75xAC6MTnjRl61kV6SDm", category: "２、テキーラ", name: "B,チャムコス・ブランコ", nameEn: "Chamucos Blanco", price: 1200, isSoldOut: false, options: ["ハイボール", "ハーフロック", "ロック", "ストレート", "トニック割：+50"], optionsEn: ["Highball", "Half Rock", "On the Rocks", "Straight", "with Tonic: +50"] },
  { id: "WA2r531CqJFRHTDdT0jl", price: 900, category: "２、テキーラ", name: "B、ドン・フリオ・ブランコ", nameEn: "Don Julio Blanco", isSoldOut: false, options: ["ハイボール", "ハーフロック", "ロック", "ストレート", "トニック割：+50"], optionsEn: ["Highball", "Half Rock", "On the Rocks", "Straight", "with Tonic: +50"] },
  { id: "bAc5CjWwvvDH0RU8fYcy", price: 900, name: "R,エスポロン・テキーラ・レポサド", nameEn: "Espolón Reposado", category: "２、テキーラ", isSoldOut: false, options: ["ハイボール", "ハーフロック", "ロック", "ストレート", "トニック割：+50"], optionsEn: ["Highball", "Half Rock", "On the Rocks", "Straight", "with Tonic: +50"] },
  { id: "sO7BJUMqcPZJsT1fESmv", options: [], optionsEn: [], isSoldOut: false, category: "３、ソフトドリンク", price: 600, name: "オレンジジュース", nameEn: "Orange Juice" },
  { id: "rKidkeBTk97nGmq9AV8o", isSoldOut: false, category: "３、ソフトドリンク", price: 600, options: [], optionsEn: [], name: "コーラー", nameEn: "Coca Cola" },
  { id: "IUWTpu2sQR0ugxQxhMjm", options: [], optionsEn: [], name: "烏龍茶", nameEn: "Oolong Tea", category: "３、ソフトドリンク", isSoldOut: false, price: 600 },
  { id: "ID_MOCKTAIL_01", options: [], optionsEn: [], name: "モクテル", nameEn: "Mocktail", category: "３、ソフトドリンク", isSoldOut: false, price: 900 },
  { id: "W6DgMzIPiPLH5ON7XgHe", price: 1780, isSoldOut: false, name: "１、タコス３種盛り", nameEn: "3 Tacos Platter", category: "４、タコス", options: [], optionsEn: [] },
  { id: "waFFM8URVrQR0AJ1Nsmf", isSoldOut: false, options: [], optionsEn: [], price: 520, category: "４、タコス", name: "2,カルニータス(タコス）", nameEn: "Carnitas Taco" },
  { id: "pwsdDEhcZuTfbUqUzx2E", options: [], optionsEn: [], price: 650, name: "3,牛タンのレングア（タコス）", nameEn: "Beef Tongue Taco", category: "４、タコス", isSoldOut: false },
  { id: "rUBkfCVHJn4LGQExYX0q", isSoldOut: false, price: 820, name: "4,和牛のカルネ・アサーダ（タコス）", nameEn: "Wagyu Carne Asada Taco", category: "４、タコス", options: [], optionsEn: [] },
  { id: "ikLXUQkB4IRnsTJzN28t", options: [], optionsEn: [], name: "５、海老アボカド（タコス）", nameEn: "Shrimp & Avocado Taco", category: "４、タコス", price: 670, isSoldOut: false },
  { id: "S3HpIm8w8jNCeCobzk8I", name: "1,春菊のライムサラダ", nameEn: "Shungiku Lime Salad", category: "５、サラダ", price: 810, isSoldOut: false, options: ["フルサイズ", "ハーフサイズ：-200"], optionsEn: ["Full Size", "Half Size: -200"] },
  { id: "0dudLzhoreR7n6G2WwLm", name: "２、メキシカングリーンサラダ", nameEn: "Mexican Green Salad", price: 980, isSoldOut: false, category: "５、サラダ", options: ["フルサイズ", "ハーフサイズ：-200"], optionsEn: ["Full Size", "Half Size: -200"] },
  { id: "5SxEJEWXvcRffBe0zMMX", options: [], optionsEn: [], category: "６、サイドメニュー＆小皿", price: 550, isSoldOut: false, name: "おつまみケサディーヤ１枚", nameEn: "Quesadilla (1pc)" },
  { id: "du5KtMdFJqBxM1DVy5Lm", name: "おつまみレングア", nameEn: "Beef Tongue Appetizer", isSoldOut: false, options: [], optionsEn: [], price: 580, category: "６、サイドメニュー＆小皿" },
  { id: "slSx6yaiNOwATE2cWAoX", isSoldOut: false, price: 100, options: [], optionsEn: [], category: "６、サイドメニュー＆小皿", name: "トルティーヤ（生地のみ）", nameEn: "Tortilla" },
  { id: "Mr4wHMA2tyJgZI7vZ4fq", options: [], optionsEn: [], isSoldOut: false, name: "サルサで食べるトルティーヤチップス", nameEn: "Tortilla Chips with Salsa", price: 530, category: "６、サイドメニュー＆小皿" },
  { id: "A1YdpNmwW2o7y846qJ7p", isSoldOut: false, price: 710, name: "ジョロキアソーセージ（5本）", nameEn: "Ghost Pepper Sausage (5pcs)", category: "６、サイドメニュー＆小皿", options: [], optionsEn: [] },
  { id: "VOG5hgxtfKu3iNLGE0kd", category: "７、ライス", name: "小盛りの〆カレー", nameEn: "Mini Curry", price: 450, isSoldOut: false, options: [], optionsEn: [] },
  { id: "c4Ps6AADdT9NZtur6181", name: "ハラペーニョ", nameEn: "Jalapeño", isSoldOut: false, options: [], optionsEn: [], price: 300, category: "６、サイドメニュー＆小皿" },
  { id: "EM6WBsxrQuRy7gF5maPM", options: [], optionsEn: [], isSoldOut: false, category: "６、サイドメニュー＆小皿", price: 1200, name: "ナチョス", nameEn: "Nachos" },
  { id: "lPkiIMFzAuWNCMLiLHYt", category: "６、サイドメニュー＆小皿", price: 680, options: [], optionsEn: [], name: "平飼い卵のベーコンエッグ", nameEn: "Free-range Bacon & Eggs", isSoldOut: false },
  { id: "nZnQ1KALECqRnT4vMW13", name: "１、カルニータス・ライス", nameEn: "Carnitas Rice", price: 1350, isSoldOut: false, category: "７、ライス", options: ["普通もり", "大盛り:+150"], optionsEn: ["Regular", "Large: +150"] },
  { id: "z4wlsaUCrY39VFCMCe1E", price: 1420, isSoldOut: false, category: "７、ライス", name: "２、牛タンのレングアライス", nameEn: "Beef Tongue Rice", options: ["普通盛り", "大盛り：+150"], optionsEn: ["Regular", "Large: +150"] },
  { id: "noQSh4ZDTbgW7NQl2FPB", category: "７、ライス", name: "３、和牛のステーキライス", nameEn: "Wagyu Steak Rice", price: 1700, isSoldOut: false, options: ["普通盛り", "大盛り：+150"], optionsEn: ["Regular", "Large: +150"] },
  { id: "ID_BROCCOLI_01", options: [], optionsEn: [], name: "ブロッコリーのクミン炒め", nameEn: "Stir-fried Broccoli with Cumin", category: "６、サイドメニュー＆小皿", isSoldOut: false, price: 680 },
  { id: "ID_CHIMI_01", options: [], optionsEn: [], name: "チミチャンガとミルクアイス", nameEn: "Chimichanga & Ice Cream", category: "9、デザート", isSoldOut: false, price: 670 },
  { id: "ID_ICE_01", options: [], optionsEn: [], name: "自家製ミルクアイス", nameEn: "Homemade Milk Ice Cream", category: "9、デザート", isSoldOut: false, price: 450 },
  { id: "ID_FISH_01", options: [], optionsEn: [], name: "フィッシュフリートたら", nameEn: "Fried Fish (Cod)", category: "６、サイドメニュー＆小皿", isSoldOut: false, price: 960 },
  { id: "ID_DIRTY_01", options: [], optionsEn: [], name: "ダーティーフリート", nameEn: "Dirty Fries", category: "６、サイドメニュー＆小皿", isSoldOut: false, price: 980 },
  { id: "ID_JALA_FRIT_01", options: [], optionsEn: [], name: "ハラペーニョフリート", nameEn: "Fried Jalapeños", category: "６、サイドメニュー＆小皿", isSoldOut: false, price: 680 },
];

const CATEGORY_ORDER = [
  "１、アルコール", "２、テキーラ", "３、ソフトドリンク", "４、タコス",
  "５、サラダ", "６、サイドメニュー＆小皿", "７、ライス", "８、その他", "9、デザート",
];

const CATEGORY_TRANSLATIONS = {
  "１、アルコール": { en: "Alcohol",    zh: "酒精饮料", ko: "주류" },
  "２、テキーラ":   { en: "Tequila",    zh: "龙舌兰",   ko: "데킬라" },
  "３、ソフトドリンク": { en: "Soft Drinks", zh: "软饮料", ko: "소프트드링크" },
  "４、タコス":     { en: "Tacos",      zh: "塔可",     ko: "타코" },
  "５、サラダ":     { en: "Salad",      zh: "沙拉",     ko: "샐러드" },
  "６、サイドメニュー＆小皿": { en: "Sides & Tapas", zh: "小食", ko: "사이드" },
  "７、ライス":     { en: "Rice",       zh: "米饭",     ko: "밥" },
  "８、その他":     { en: "Others",     zh: "其他",     ko: "기타" },
  "9、デザート":    { en: "Dessert",    zh: "甜点",     ko: "디저트" },
  ALL:              { en: "ALL",        zh: "全部",     ko: "전체" },
};
const getCatLabel = (cat, lang) =>
  lang === "ja" ? cat : (CATEGORY_TRANSLATIONS[cat]?.[lang] || CATEGORY_TRANSLATIONS[cat]?.en || cat);
const getItemName = (item, lang) =>
  lang === "ja" ? item.name : (item.nameEn || item.name);
const LANG_LABELS = { ja: "日本語", en: "EN", zh: "中文", ko: "한국어" };
const LANG_ORDER = ["ja", "en", "zh", "ko"];

const TRANSLATIONS = {
  ja: {
    back: "戻る", confirmOrder: "注文確定", addMenu: "メニュー追加", editMenu: "メニュー編集",
    itemLabel: "商品名", itemEnLabel: "英語名", priceLabel: "価格", categoryLabel: "カテゴリ",
    save: "保存する", kitchen: "厨房オーダー", tables: "テーブル選択", done: "提供完了",
    sent: "注文を送信しました", addCharge: "チャージ料追加", cancel: "閉じる",
    inviteTitle: "接続用QRコード", copyLink: "URLをコピー", manageMenu: "メニュー管理",
    createNew: "新規作成", staffLink: "スタッフ用", guestLink: "客席用", help: "使い方",
    sortOrder: "表示順 (数字が小さいほど上)", imageUrl: "画像URL (任意)",
    soldOut: "品切れ", add: "追加", chooseOption: "オプションを選んでください",
  },
  en: {
    back: "Back", confirmOrder: "Order", addMenu: "Add Item", editMenu: "Edit Item",
    itemLabel: "Item Name", itemEnLabel: "English Name", priceLabel: "Price", categoryLabel: "Category",
    save: "Save", kitchen: "Kitchen", tables: "Tables", done: "Served",
    sent: "Order Sent!", addCharge: "Add Charge", cancel: "Close",
    inviteTitle: "Connect QR", copyLink: "Copy Link", manageMenu: "Manage Menu",
    createNew: "Create New", staffLink: "For Staff", guestLink: "For Guest", help: "Help",
    sortOrder: "Sort Order", imageUrl: "Image URL (Optional)",
    soldOut: "Sold Out", add: "Add", chooseOption: "Choose an option",
  },
  zh: {
    back: "返回", confirmOrder: "确认订单", addMenu: "添加菜品", editMenu: "编辑菜品",
    itemLabel: "菜品名", itemEnLabel: "英文名", priceLabel: "价格", categoryLabel: "分类",
    save: "保存", kitchen: "厨房", tables: "桌台", done: "已上菜",
    sent: "订单已发送！", addCharge: "添加费用", cancel: "关闭",
    inviteTitle: "连接二维码", copyLink: "复制链接", manageMenu: "菜单管理",
    createNew: "新建", staffLink: "员工端", guestLink: "客人端", help: "帮助",
    sortOrder: "显示顺序", imageUrl: "图片URL（可选）",
    soldOut: "售完", add: "添加", chooseOption: "请选择选项",
  },
  ko: {
    back: "돌아가기", confirmOrder: "주문 확정", addMenu: "메뉴 추가", editMenu: "메뉴 편집",
    itemLabel: "상품명", itemEnLabel: "영문명", priceLabel: "가격", categoryLabel: "카테고리",
    save: "저장", kitchen: "주방", tables: "테이블", done: "제공 완료",
    sent: "주문이 전송되었습니다!", addCharge: "요금 추가", cancel: "닫기",
    inviteTitle: "연결 QR코드", copyLink: "URL 복사", manageMenu: "메뉴 관리",
    createNew: "새로 만들기", staffLink: "직원용", guestLink: "손님용", help: "도움말",
    sortOrder: "표시 순서", imageUrl: "이미지 URL (선택)",
    soldOut: "품절", add: "추가", chooseOption: "옵션을 선택하세요",
  },
};

const parseOption = (optionStr) => {
  if (!optionStr) return { label: "", priceDiff: 0 };
  const regex = /^(.*?)(?:[:：]([+\-]?\d+))?$/;
  const match = optionStr.match(regex);
  if (match) return { label: match[1].trim(), priceDiff: match[2] ? parseInt(match[2], 10) : 0 };
  return { label: optionStr, priceDiff: 0 };
};

/* ===========================================
   COMPONENTS
   =========================================== */

const TableDetailModal = ({ tableNumber, orders, onClose, onCheckout, onAddOrder, onUpdateOrder, onDeleteOrder, lang }) => {
  const tableOrders = orders.filter((o) => String(o.tableNumber) === String(tableNumber) && !o.isPaid && (o.items?.length ?? 0) > 0);
  const aggregatedItems = [];
  tableOrders.forEach((order) => {
    order.items.forEach((item) => {
      const existing = aggregatedItems.find((i) => i.cartId === item.cartId);
      if (existing) existing.quantity += item.quantity;
      else aggregatedItems.push({ ...item });
    });
  });
  const totalAmount = tableOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  const handleCancelItem = async (cartId) => {
    const reversed = [...tableOrders].reverse();
    for (const order of reversed) {
      const item = order.items.find(i => i.cartId === cartId && i.quantity > 0);
      if (item) {
        const newItems = order.items
          .map(i => i.cartId === cartId ? { ...i, quantity: i.quantity - 1 } : i)
          .filter(i => i.quantity > 0);
        const newTotal = newItems.reduce((s, i) => s + i.finalPrice * i.quantity, 0);
        try {
          if (newItems.length === 0) {
            await onDeleteOrder(order.id);
          } else {
            await onUpdateOrder(order.id, { items: newItems, totalAmount: newTotal });
          }
        } catch (e) { alert("取消エラー: " + e.message); }
        return;
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[150] p-4 backdrop-blur-md">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-orange-500 text-white p-4 flex justify-between items-center">
          <h3 className="font-black text-xl flex items-center"><Receipt className="mr-2" /> Table {tableNumber}</h3>
          <button onClick={onClose} className="min-w-[44px] min-h-[44px] flex justify-center items-center"><X size={24} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {aggregatedItems.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm border border-gray-100">
              <div className="flex-1 font-bold text-gray-800 text-sm">
                {lang === "en" ? item.nameEn || item.name : item.name}
                {item.optionLabel && <div className="text-[10px] text-blue-500 font-black bg-blue-50 inline-block px-1.5 rounded mt-1">{item.optionLabel}</div>}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleCancelItem(item.cartId)}
                  className="p-2 bg-red-50 text-red-500 rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center active:scale-95 active:bg-red-100"
                >
                  <Minus size={16} />
                </button>
                <span className="font-black text-gray-500 text-sm w-6 text-center">×{item.quantity}</span>
                <span className="font-black text-gray-800 min-w-[64px] text-right text-sm">¥{(item.finalPrice * item.quantity).toLocaleString()}</span>
              </div>
            </div>
          ))}
          {aggregatedItems.length === 0 && <div className="text-center text-gray-400 py-10 font-bold">注文はありません</div>}
        </div>
        <div className="p-4 bg-white border-t-2 border-gray-100">
          <div className="flex justify-between items-end mb-4">
            <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">Total</span>
            <span className="text-3xl font-black text-orange-600">¥{totalAmount.toLocaleString()}</span>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <button
              onClick={onAddOrder}
              className="py-3 bg-orange-50 text-orange-600 border-2 border-orange-200 rounded-xl font-black text-sm min-h-[44px] active:scale-95 transition flex items-center justify-center"
            >
              <Plus size={16} className="mr-1" /> 追加注文
            </button>
            <button
              onClick={() => { if (window.confirm("会計済みにしますか？")) onCheckout(tableNumber); }}
              className="py-3 bg-blue-600 text-white rounded-xl font-black text-sm min-h-[44px] active:scale-95 transition"
            >
              会計済み (クリア)
            </button>
          </div>
          <button onClick={onClose} className="w-full py-3 bg-gray-100 text-gray-500 rounded-xl font-black text-sm min-h-[44px]">閉じる</button>
        </div>
      </div>
    </div>
  );
};

const ManageMenuModal = ({ onClose, menuData, onSave, onDelete, onToggleSoldOut, lang }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [name, setName] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("８、その他");
  const [imageUrl, setImageUrl] = useState("");
  const [sortOrder, setSortOrder] = useState(100);
  const [options, setOptions] = useState([]);
  const [optionsEn, setOptionsEn] = useState([]);
  const [newOptJa, setNewOptJa] = useState("");
  const [newOptEn, setNewOptEn] = useState("");
  const [newOptPrice, setNewOptPrice] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const storageRef = ref(storage, `menu-images/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setImageUrl(url);
    } catch (err) {
      alert("画像のアップロードに失敗しました: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };
  const t = TRANSLATIONS[lang];

  const categories = useMemo(() => {
    const cats = new Set(menuData.map((m) => m.category));
    return ["１、アルコール", "２、テキーラ", "３、ソフトドリンク", "４、タコス", "５、サラダ", "６、サイドメニュー＆小皿", "７、ライス", "８、その他", "9、デザート", ...cats];
  }, [menuData]);

  const resetForm = () => {
    setIsEditing(false); setCurrentId(null); setName(""); setNameEn("");
    setPrice(""); setCategory("８、その他"); setImageUrl(""); setSortOrder(100);
    setOptions([]); setOptionsEn([]); setNewOptJa(""); setNewOptEn(""); setNewOptPrice("");
  };

  const handleEdit = (item) => {
    setIsEditing(true); setCurrentId(item.id); setName(item.name); setNameEn(item.nameEn || "");
    setPrice(item.price); setCategory(item.category); setImageUrl(item.imageUrl || ""); setSortOrder(item.sortOrder || 100);
    setOptions(item.options || []); setOptionsEn(item.optionsEn || []);
    setNewOptJa(""); setNewOptEn(""); setNewOptPrice("");
    document.getElementById("manage-form")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleAddOption = () => {
    if (!newOptJa.trim()) return;
    const pricePart = newOptPrice ? `：${parseInt(newOptPrice) > 0 ? "+" : ""}${newOptPrice}` : "";
    const enPricePart = newOptPrice ? `: ${parseInt(newOptPrice) > 0 ? "+" : ""}${newOptPrice}` : "";
    setOptions(prev => [...prev, newOptJa.trim() + pricePart]);
    setOptionsEn(prev => [...prev, (newOptEn.trim() || newOptJa.trim()) + enPricePart]);
    setNewOptJa(""); setNewOptEn(""); setNewOptPrice("");
  };

  const handleRemoveOption = (idx) => {
    setOptions(prev => prev.filter((_, i) => i !== idx));
    setOptionsEn(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !price) return;

    let finalNameEn = nameEn.trim();
    if (!finalNameEn) {
      setIsTranslating(true);
      try {
        const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(name)}&langpair=ja|en`);
        const data = await res.json();
        if (data.responseStatus === 200 && data.responseData?.translatedText) {
          finalNameEn = data.responseData.translatedText;
        }
      } catch {
        finalNameEn = name;
      } finally {
        setIsTranslating(false);
      }
    }

    const existing = isEditing ? menuData.find(m => m.id === currentId) : null;
    const newItem = {
      id: currentId || "PROD_" + Date.now(),
      name, nameEn: finalNameEn || name, price: parseInt(price), category,
      imageUrl: imageUrl.trim(), sortOrder: parseInt(sortOrder) || 100,
      options: options,
      optionsEn: optionsEn,
      isSoldOut: existing?.isSoldOut ?? false,
    };
    onSave(newItem);
    resetForm();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[200] p-4 backdrop-blur-md">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-gray-800 text-white p-4 flex justify-between items-center sticky top-0 z-10">
          <h3 className="font-black text-lg flex items-center"><Settings size={20} className="mr-2" />{t.manageMenu}</h3>
          <button onClick={onClose} className="min-w-[44px] min-h-[44px] flex justify-center items-center hover:bg-gray-700 rounded-full"><X size={24} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50">
          <form id="manage-form" onSubmit={handleSubmit} className="bg-white p-5 rounded-2xl border-2 border-blue-100 shadow-sm space-y-4">
            <h4 className="font-black text-gray-800 border-b-2 border-gray-100 pb-2 flex justify-between">
              {isEditing ? t.editMenu : t.addMenu}
              {isEditing && <button type="button" onClick={resetForm} className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded-full">{t.createNew}</button>}
            </h4>
            <div className="grid grid-cols-1 gap-3">
              <input className="w-full border p-3 rounded-xl font-bold" value={name} onChange={(e) => setName(e.target.value)} required placeholder={t.itemLabel} />
              <div>
                <input className="w-full border p-3 rounded-xl font-bold" value={nameEn} onChange={(e) => setNameEn(e.target.value)} placeholder={t.itemEnLabel} />
                {!nameEn && <p className="text-[10px] text-gray-400 mt-1 pl-1">空白のまま保存すると自動翻訳されます</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input type="number" className="w-full border p-3 rounded-xl font-bold" value={price} onChange={(e) => setPrice(e.target.value)} required placeholder={t.priceLabel} />
                <select className="w-full border p-3 rounded-xl font-bold text-sm" value={category} onChange={(e) => setCategory(e.target.value)}>
                  {Array.from(new Set(categories)).map((c) => (<option key={c} value={c}>{getCatLabel(c, lang)}</option>))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-400 mb-1">📷 {t.imageUrl}</label>
                {imageUrl ? (
                  <div className="relative">
                    <img src={imageUrl} alt="preview" className="w-full h-32 object-cover rounded-xl border-2 border-orange-200" />
                    <button type="button" onClick={() => setImageUrl("")} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-black">✕</button>
                  </div>
                ) : (
                  <label className={`flex items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition ${isUploading ? "opacity-50 pointer-events-none" : ""}`}>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    {isUploading ? (
                      <span className="text-sm text-orange-500 font-black animate-pulse">⏫ アップロード中...</span>
                    ) : (
                      <div className="text-center">
                        <div className="text-2xl">📸</div>
                        <div className="text-xs text-gray-500 font-bold mt-1">タップして画像を選択</div>
                      </div>
                    )}
                  </label>
                )}
                <input className="w-full border p-2 rounded-xl text-xs text-gray-500" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="または画像URLを直接入力" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 mb-1">{t.sortOrder}</label>
                <input type="number" className="w-full border p-3 rounded-xl font-bold" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
              </div>
              <div className="bg-blue-50 rounded-xl p-3 space-y-2">
                <label className="block text-[10px] font-black text-blue-600 mb-1">🔧 オプション設定（例：ロック、ハイボール、大盛り：+150）</label>
                {options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-white rounded-lg p-2 border border-blue-100">
                    <div className="flex-1 text-xs font-bold text-gray-700">{opt}</div>
                    <div className="text-[10px] text-gray-400 truncate max-w-[80px]">{optionsEn[idx]}</div>
                    <button type="button" onClick={() => handleRemoveOption(idx)} className="text-red-400 p-1 rounded min-w-[28px] min-h-[28px] flex items-center justify-center hover:bg-red-50"><X size={14} /></button>
                  </div>
                ))}
                <div className="grid grid-cols-2 gap-2">
                  <input className="border p-2 rounded-lg text-xs font-bold" value={newOptJa} onChange={e => setNewOptJa(e.target.value)} placeholder="日本語（例：ロック）" />
                  <input className="border p-2 rounded-lg text-xs font-bold" value={newOptEn} onChange={e => setNewOptEn(e.target.value)} placeholder="英語（例：On the Rocks）" />
                </div>
                <div className="flex gap-2">
                  <input type="number" className="border p-2 rounded-lg text-xs font-bold w-28" value={newOptPrice} onChange={e => setNewOptPrice(e.target.value)} placeholder="価格差（例：+150）" />
                  <button type="button" onClick={handleAddOption} className="flex-1 bg-blue-600 text-white rounded-lg text-xs font-black min-h-[36px]">＋ 追加</button>
                </div>
              </div>
            </div>
            <button type="submit" disabled={isTranslating} className={`w-full py-3 rounded-xl font-black text-lg text-white min-h-[44px] transition ${isEditing ? "bg-orange-500" : "bg-blue-600"} ${isTranslating ? "opacity-60" : ""}`}>
              {isTranslating ? "🌐 英語名を翻訳中..." : (isEditing ? t.save : t.addMenu)}
            </button>
          </form>
          <div className="space-y-3 pb-10">
            {menuData.sort((a,b) => (a.sortOrder||100)-(b.sortOrder||100)).map((item) => (
              <div key={item.id} className={`flex justify-between items-center p-3 bg-white border-2 rounded-xl ${item.isSoldOut ? "border-red-200 bg-red-50" : "border-gray-100"}`}>
                <div className="flex-1 overflow-hidden">
                  <div className={`font-bold text-sm truncate ${item.isSoldOut ? "text-gray-400 line-through" : "text-gray-800"}`}>{item.name}</div>
                  <div className="text-xs text-blue-600 font-black">¥{item.price.toLocaleString()} <span className="text-gray-400 ml-1">[{item.sortOrder || 100}]</span>
                    {item.isSoldOut && <span className="ml-2 text-red-500 font-black">SOLD OUT</span>}
                  </div>
                </div>
                <div className="flex space-x-2 ml-2">
                  <button
                    onClick={() => onToggleSoldOut(item)}
                    className={`p-3 rounded-lg min-w-[44px] min-h-[44px] flex justify-center items-center text-xs font-black ${item.isSoldOut ? "bg-green-100 text-green-600" : "bg-red-50 text-red-400"}`}
                    title={item.isSoldOut ? "販売再開" : "品切れにする"}
                  >
                    {item.isSoldOut ? "✓再開" : "×切"}
                  </button>
                  <button onClick={() => handleEdit(item)} className="p-3 bg-gray-50 rounded-lg min-w-[44px] min-h-[44px] flex justify-center items-center"><Pencil size={16} /></button>
                  <button onClick={() => { if (window.confirm("削除しますか？")) onDelete(item.id); }} className="p-3 bg-red-50 text-red-500 rounded-lg min-w-[44px] min-h-[44px] flex justify-center items-center"><Trash size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const InviteModal = ({ onClose, lang }) => {
  const [targetTable, setTargetTable] = useState("STAFF");
  const t = TRANSLATIONS[lang];
  const inviteUrl = `${window.location.origin}${window.location.pathname}${targetTable !== "STAFF" ? `?table=${targetTable}` : ""}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(inviteUrl)}&ecc=H`;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[200] p-4 backdrop-blur-md">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden p-6 text-center">
        <h3 className="font-black text-xl text-gray-800 mb-2">{t.inviteTitle}</h3>
        <div className="flex bg-gray-100 p-1 rounded-xl mb-4">
          <button onClick={() => setTargetTable("STAFF")} className={`flex-1 py-3 rounded-lg text-xs font-black min-h-[44px] ${targetTable === "STAFF" ? "bg-white text-blue-600 shadow-sm" : "text-gray-400"}`}>{t.staffLink}</button>
          <button onClick={() => setTargetTable("1")} className={`flex-1 py-3 rounded-lg text-xs font-black min-h-[44px] ${targetTable !== "STAFF" ? "bg-white text-orange-600 shadow-sm" : "text-gray-400"}`}>{t.guestLink}</button>
        </div>
        {targetTable !== "STAFF" && (
          <div className="flex overflow-x-auto space-x-2 pb-4 scrollbar-hide">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
              <button key={n} onClick={() => setTargetTable(String(n))} className={`min-w-[44px] min-h-[44px] rounded-full font-black border-2 flex-shrink-0 ${String(n) === targetTable ? "bg-orange-500 border-orange-500 text-white" : "bg-white text-gray-400"}`}>{n}</button>
            ))}
          </div>
        )}
        <div className="bg-white p-4 border-4 border-gray-50 rounded-2xl mb-6 flex justify-center"><img src={qrCodeUrl} alt="QR" className="w-48 h-48 mix-blend-multiply" /></div>
        <button onClick={onClose} className="w-full py-3 text-gray-400 font-bold min-h-[44px]">{t.cancel}</button>
      </div>
    </div>
  );
};

const TableSelectionView = ({ onSelectTable, orders, onCheckoutTable, onUpdateOrder, onDeleteOrder, lang }) => {
  const [detailTable, setDetailTable] = useState(null);
  const tableStatus = useMemo(() => {
    const s = {};
    orders.forEach((o) => { if (!o.isPaid && (o.items?.length ?? 0) > 0) { const k = String(o.tableNumber); if (!s[k]) s[k] = { total: 0 }; s[k].total += o.totalAmount; } });
    return s;
  }, [orders]);

  return (
    <>
      {detailTable && (
        <TableDetailModal
          tableNumber={detailTable}
          orders={orders}
          lang={lang}
          onClose={() => setDetailTable(null)}
          onCheckout={(num) => { onCheckoutTable(num); setDetailTable(null); }}
          onAddOrder={() => { setDetailTable(null); onSelectTable(detailTable); }}
          onUpdateOrder={onUpdateOrder}
          onDeleteOrder={onDeleteOrder}
        />
      )}
      <div className="p-4 grid grid-cols-3 gap-4 overflow-y-auto h-full bg-gray-50 pb-24">
        {Array.from({ length: 12 }, (_, i) => String(i + 1)).map((num) => (
          <button key={num} onClick={() => tableStatus[num] ? setDetailTable(num) : onSelectTable(num)} className={`h-24 rounded-[2rem] border-4 flex flex-col items-center justify-center font-black active:scale-95 transition min-h-[80px] ${tableStatus[num] ? "bg-orange-50 border-orange-500 text-orange-700" : "bg-white border-gray-100 text-gray-300"}`}>
            <span className="text-3xl">{num}</span>
            {tableStatus[num] && <span className="text-[10px] font-black bg-orange-500 text-white px-2 py-0.5 rounded-full mt-1">¥{tableStatus[num].total.toLocaleString()}</span>}
          </button>
        ))}
      </div>
    </>
  );
};

const KitchenView = ({ orders, onUpdateOrder, lang }) => {
  const [confirmItem, setConfirmItem] = useState(null);

  const handleItemComplete = async () => {
    const { orderId, itemIdx } = confirmItem;
    const order = orders.find(o => o.id === orderId);
    const newItems = order.items.filter((_, i) => i !== itemIdx);
    if (newItems.length === 0) {
      await onUpdateOrder(orderId, { status: "completed" });
    } else {
      await onUpdateOrder(orderId, { items: newItems });
    }
    setConfirmItem(null);
  };

  return (
    <div className="p-4 space-y-4 bg-gray-900 h-full overflow-y-auto pb-24">
      {confirmItem && (
        <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-6">
          <div className="bg-white rounded-[2rem] p-6 w-full max-w-sm text-center space-y-4 shadow-2xl">
            <div className="text-4xl">✅</div>
            <h3 className="font-black text-xl text-gray-800">提供完了にしますか？</h3>
            <p className="font-bold text-gray-600 bg-gray-50 rounded-xl px-4 py-3">{confirmItem.itemName}</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmItem(null)} className="flex-1 py-3 rounded-xl font-black bg-gray-100 text-gray-600 min-h-[44px]">キャンセル</button>
              <button onClick={handleItemComplete} className="flex-1 py-3 rounded-xl font-black bg-green-600 text-white min-h-[44px]">提供完了</button>
            </div>
          </div>
        </div>
      )}
      <h2 className="text-white text-2xl font-black flex items-center mb-6"><Utensils className="mr-3" /> {TRANSLATIONS[lang].kitchen}</h2>
      {orders.filter((o) => o.status === "pending").map((order) => (
        <div key={order.id} className="bg-white rounded-[2.5rem] p-6 shadow-2xl border-l-[12px] border-red-500">
          <div className="flex justify-between items-center border-b-2 pb-4 mb-4">
            <span className="font-black text-4xl text-gray-800">{order.tableNumber}<span className="text-xs ml-1 text-gray-400">Table</span></span>
            <span className="font-black bg-yellow-100 text-yellow-700 px-3 py-1.5 rounded-xl flex items-center text-sm">
              <Clock size={14} className="mr-1.5" />
              {new Date(order.createdAt).toLocaleTimeString('ja-JP', { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
          </div>
          <div className="space-y-4 mb-6">
            {order.items.map((item, idx) => (
              <div
                key={idx}
                onClick={() => setConfirmItem({ orderId: order.id, itemIdx: idx, itemName: `${lang === "en" ? item.nameEn || item.name : item.name}${item.optionLabel ? ` (${item.optionLabel})` : ""} × ${item.quantity}` })}
                className="flex justify-between items-start border-b border-dashed pb-2 cursor-pointer active:bg-green-50 rounded-lg px-2 py-1 transition"
              >
                <div className="flex-1">
                  <div className="font-black text-xl text-gray-800">{lang === "en" ? item.nameEn || item.name : item.name}</div>
                  {item.optionLabel && <div className="text-xs font-black text-blue-600 bg-blue-50 inline-block px-2 rounded-full">{item.optionLabel}</div>}
                </div>
                <div className="font-black text-3xl text-orange-600 ml-4">x{item.quantity}</div>
              </div>
            ))}
          </div>
          <button onClick={() => onUpdateOrder(order.id, { status: "completed" })} className="w-full bg-green-600 text-white py-5 rounded-[1.5rem] font-black text-xl active:scale-95 transition flex items-center justify-center min-h-[44px]">
            <CheckCircle className="mr-2" size={24} /> {TRANSLATIONS[lang].done}
          </button>
        </div>
      ))}
    </div>
  );
};

const OrderView = ({ menuData, tableNumber, onBackToTables, onOrderSubmit, lang, isGuest, toggleLang }) => {
  const [cart, setCart] = useState([]);
  const [activeCat, setActiveCat] = useState("ALL");
  const [optionTarget, setOptionTarget] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [myOrders, setMyOrders] = useState([]);
  const [showMyOrders, setShowMyOrders] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const tipShown = useRef(false);
  const t = TRANSLATIONS[lang];

  const categories = useMemo(() => {
    const cats = new Set(menuData.filter(i => i.category).map((i) => i.category.trim()));
    const sorted = Array.from(cats).sort((a, b) => {
      const ai = CATEGORY_ORDER.findIndex(c => c.trim() === a);
      const bi = CATEGORY_ORDER.findIndex(c => c.trim() === b);
      if (ai === -1 && bi === -1) return a.localeCompare(b, "ja");
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });
    return ["ALL", ...sorted];
  }, [menuData]);

  const addToCart = (item, optionIdx = null) => {
    const optionStr = optionIdx !== null ? item.options[optionIdx] : null;
    const optionStrEn = optionIdx !== null ? (item.optionsEn?.[optionIdx] || optionStr) : null;
    const parsed = optionStr ? parseOption(optionStr) : { priceDiff: 0 };
    const finalPrice = item.price + parsed.priceDiff;
    const cartId = item.id + (optionIdx !== null ? `_${optionIdx}` : "");
    const optionLabel = optionStr ? parseOption(optionStr).label : "";
    const optionLabelEn = optionStrEn ? parseOption(optionStrEn).label : "";
    setCart((prev) => {
      const idx = prev.findIndex((ci) => ci.cartId === cartId);
      if (idx > -1) return prev.map((ci) => ci.cartId === cartId ? { ...ci, quantity: ci.quantity + 1 } : ci);
      return [...prev, { cartId, id: item.id, name: item.name, nameEn: item.nameEn, finalPrice, quantity: 1, optionLabel, optionLabelEn }];
    });
  };

  const incrementCart = (cartId) => {
    setCart((prev) => prev.map((ci) => ci.cartId === cartId ? { ...ci, quantity: ci.quantity + 1 } : ci));
  };

  const removeFromCart = (cartId) => {
    setCart((prev) => prev.reduce((acc, ci) => {
      if (ci.cartId === cartId) return ci.quantity > 1 ? [...acc, { ...ci, quantity: ci.quantity - 1 }] : acc;
      return [...acc, ci];
    }, []));
  };

  const handleAddItem = (item) => {
    if (item.isSoldOut) return;
    if (isGuest && !tipShown.current) {
      tipShown.current = true;
      setShowTip(true);
      setTimeout(() => setShowTip(false), 4000);
    }
    if (item.options?.length > 0) setOptionTarget(item);
    else addToCart(item, null);
  };

  const total = cart.reduce((s, i) => s + i.finalPrice * i.quantity, 0);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {showMyOrders && (
        <div className="fixed inset-0 bg-black/60 z-[300] flex items-end justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-sm max-h-[70vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-5 border-b">
              <h2 className="font-black text-lg text-gray-800 flex items-center">
                <Receipt className="mr-2 text-orange-500" size={18} />
                {lang === "ja" ? "注文履歴" : lang === "en" ? "Order History" : lang === "zh" ? "点餐记录" : "주문 내역"}
              </h2>
              <button onClick={() => setShowMyOrders(false)} className="p-2 bg-gray-100 rounded-xl min-w-[44px] min-h-[44px] flex items-center justify-center"><X size={18} /></button>
            </div>
            <div className="overflow-y-auto flex-1 p-4 space-y-3">
              {myOrders.map((order, i) => (
                <div key={i} className="border border-gray-100 rounded-xl p-3 bg-orange-50">
                  <div className="text-xs text-gray-400 font-bold mb-2 flex items-center"><Clock size={11} className="mr-1" />{new Date(order.time).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}</div>
                  {order.items.map((item, j) => (
                    <div key={j} className="flex justify-between text-sm text-gray-700">
                      <span>{getItemName(item, lang)}{item.optionLabel ? ` (${item.optionLabel})` : ''} × {item.quantity}</span>
                      <span className="font-bold ml-2">¥{(item.finalPrice * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="text-right font-black text-orange-600 mt-2 border-t border-orange-100 pt-1 text-sm">¥{order.total.toLocaleString()}</div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t bg-gray-50">
              <div className="flex justify-between font-black text-lg">
                <span>{lang === "ja" ? "合計" : lang === "en" ? "Total" : lang === "zh" ? "合计" : "합계"}</span>
                <span className="text-orange-600">¥{myOrders.reduce((s, o) => s + o.total, 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}
      {showHelp && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[300] p-4 backdrop-blur-md" onClick={() => setShowHelp(false)}>
          <div className="bg-white rounded-[2rem] w-full max-w-sm p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="font-black text-xl text-gray-800">📱 {lang === "ja" ? "ご注文の方法" : "How to Order"}</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-xl">
                <span className="text-2xl">1️⃣</span>
                <div><div className="font-black text-gray-800">{lang === "ja" ? "メニューを選ぶ" : "Browse Menu"}</div><div className="text-xs text-gray-500 mt-0.5">{lang === "ja" ? "カテゴリタブからお好みのメニューを探してください" : "Use category tabs to find what you like"}</div></div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-xl">
                <span className="text-2xl">2️⃣</span>
                <div><div className="font-black text-gray-800">{lang === "ja" ? "「追加」ボタンを押す" : "Tap \"Add\""}</div><div className="text-xs text-gray-500 mt-0.5">{lang === "ja" ? "カートに追加されます。複数のメニューも選べます" : "Items are added to your cart. You can select multiple items"}</div></div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-xl">
                <span className="text-2xl">3️⃣</span>
                <div><div className="font-black text-gray-800">{lang === "ja" ? "「注文確定」ボタンを押す" : "Confirm Your Order"}</div><div className="text-xs text-gray-500 mt-0.5">{lang === "ja" ? "画面下部の合計ボタンで注文を確定してください" : "Tap the total button at the bottom to place your order"}</div></div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl">
                <span className="text-2xl">💡</span>
                <div><div className="font-black text-gray-800">{lang === "ja" ? "追加注文もできます" : "Add More Anytime"}</div><div className="text-xs text-gray-500 mt-0.5">{lang === "ja" ? "何度でも注文できます！スタッフをお呼びの際はお声がけください" : "You can order multiple times. Call staff if you need help"}</div></div>
              </div>
            </div>
            <button onClick={() => setShowHelp(false)} className="w-full py-3 bg-orange-500 text-white rounded-xl font-black text-base min-h-[44px]">
              {lang === "ja" ? "閉じる" : "Close"}
            </button>
          </div>
        </div>
      )}
      {optionTarget && (
        <div className="fixed inset-0 bg-black/60 flex items-end justify-center z-[300] p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-sm p-6 space-y-3">
            <h4 className="font-black text-gray-800 text-lg leading-tight">
              {getItemName(optionTarget, lang)}
            </h4>
            <p className="text-xs text-gray-400 font-bold">{t.chooseOption}</p>
            <div className="space-y-2">
              {(lang === "en" ? optionTarget.optionsEn : optionTarget.options).map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => { addToCart(optionTarget, idx); setOptionTarget(null); }}
                  className="w-full py-3 bg-gray-50 rounded-xl font-black text-sm text-gray-800 border-2 border-gray-100 active:bg-orange-50 active:border-orange-300 min-h-[44px]"
                >
                  {opt}
                </button>
              ))}
            </div>
            <button onClick={() => setOptionTarget(null)} className="w-full py-3 text-gray-400 font-bold min-h-[44px]">{t.cancel}</button>
          </div>
        </div>
      )}

      <div className="p-4 bg-white text-gray-800 flex justify-between items-center shadow-sm sticky top-0 z-50">
        {!isGuest ? (
          <button onClick={onBackToTables} className="font-black flex items-center bg-gray-100 px-3 py-2 rounded-xl min-h-[44px]">
            <ChevronLeft size={18} /> {t.back}
          </button>
        ) : (
          <button onClick={() => setShowHelp(true)} className="flex items-center font-black bg-orange-50 text-orange-600 px-3 py-2 rounded-xl min-h-[44px]">
            <HelpCircle size={18} className="mr-1" /> {t.help}
          </button>
        )}
        <div className="font-black text-2xl">Table {tableNumber}</div>
        {isGuest && (
          <button onClick={toggleLang} className="px-3 py-1 bg-gray-100 rounded-xl font-black text-xs min-h-[44px] flex items-center justify-center gap-1">
            <Languages size={14} />{LANG_LABELS[lang]}
          </button>
        )}
      </div>

      {!isGuest && (
        <div className="px-3 pt-2 pb-1 bg-white sticky top-[72px] z-40">
          <button
            onClick={() => addToCart({ id: "CHARGE", name: "チャージ", nameEn: "Cover Charge", price: 300, options: [], optionsEn: [], isSoldOut: false }, null)}
            className="w-full py-2 rounded-xl font-black text-sm bg-blue-50 text-blue-700 border-2 border-blue-200 min-h-[44px] active:scale-[0.98] transition flex items-center justify-center"
          >
            <Plus size={15} className="mr-1" /> チャージ追加　¥300
          </button>
        </div>
      )}
      <div className={`flex overflow-x-auto p-3 space-x-2 bg-white border-b scrollbar-hide sticky ${isGuest ? "top-[72px]" : "top-[124px]"} z-40 shadow-sm`}>
        {categories.map((c) => (
          <button key={c} onClick={() => setActiveCat(c)} className={`px-5 py-3 rounded-full text-sm font-black whitespace-nowrap min-h-[44px] ${activeCat === c ? "bg-orange-500 text-white shadow-md" : "bg-gray-100 text-gray-500"}`}>
            {getCatLabel(c, lang)}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3 pb-48 grid grid-cols-2 gap-3">
        {menuData
          .filter((i) => activeCat === "ALL" || i.category === activeCat)
          .sort((a, b) => (a.sortOrder || 100) - (b.sortOrder || 100))
          .map((item) => (
            <div key={item.id} className={`bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col transition ${item.isSoldOut ? "opacity-50" : "active:scale-[0.98]"}`}>
              <div className="h-32 w-full bg-gray-100 relative flex items-center justify-center border-b border-gray-50 rounded-t-2xl overflow-hidden">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="text-gray-300" size={32} />
                )}
                {item.isSoldOut && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <span className="bg-red-600 text-white text-xs font-black px-3 py-1 rounded-full">{t.soldOut}</span>
                  </div>
                )}
              </div>
              <div className="p-3 flex flex-col flex-1 justify-between">
                <div>
                  <h3 className="font-bold text-sm text-gray-800 leading-tight line-clamp-2 min-h-[2.5rem]">
                    {getItemName(item, lang)}
                  </h3>
                  <div className="font-black text-orange-600 text-lg mt-1">¥{item.price.toLocaleString()}</div>
                </div>
                <button
                  onClick={() => handleAddItem(item)}
                  disabled={item.isSoldOut}
                  className={`w-full mt-3 py-2 rounded-xl font-black flex items-center justify-center min-h-[44px] transition ${item.isSoldOut ? "bg-gray-100 text-gray-300 cursor-not-allowed" : "bg-orange-50 text-orange-600 hover:bg-orange-100"}`}
                >
                  <Plus size={18} className="mr-1" /> {item.isSoldOut ? t.soldOut : t.add}
                </button>
              </div>
            </div>
          ))}
      </div>

      {isGuest && myOrders.length > 0 && (
        <button
          onClick={() => setShowMyOrders(true)}
          className="fixed bottom-28 right-4 bg-gray-800 text-white px-3 py-2 rounded-full font-black text-xs shadow-lg flex items-center gap-1.5 z-40 active:scale-95 transition"
        >
          <Receipt size={13} />
          ¥{myOrders.reduce((s, o) => s + o.total, 0).toLocaleString()}
        </button>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.1)] z-50 rounded-t-[2rem]">
        {cart.length > 0 && (
          <div className="mb-4 max-h-32 overflow-y-auto space-y-2 border-b border-gray-100 pb-3">
            {cart.map((i) => (
              <div key={i.cartId} className="flex justify-between items-center font-bold px-1">
                <div className="text-sm truncate w-1/2">
                  <div>{getItemName(i, lang)}</div>
                  {i.optionLabel && <div className="text-[10px] text-blue-500 font-black">{lang === "ja" ? i.optionLabel : i.optionLabelEn || i.optionLabel}</div>}
                </div>
                <div className="flex items-center space-x-3">
                  <button onClick={() => removeFromCart(i.cartId)} className="text-red-500 bg-red-50 p-2 rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center"><Minus size={16} /></button>
                  <span className="text-gray-800 w-4 text-center">{i.quantity}</span>
                  <button onClick={() => incrementCart(i.cartId)} className="text-blue-500 bg-blue-50 p-2 rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center"><Plus size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
        {showTip && isGuest && (
          <div className="text-center text-xs text-orange-600 font-bold mb-2 bg-orange-50 rounded-xl py-2 px-3 animate-pulse">
            💡 {lang === "ja" ? "全て選び終わったら「注文確定」を押してください" : lang === "en" ? "Tap confirm when you're done selecting" : lang === "zh" ? "选好后请按「确认订单」" : "다 선택하셨으면 「주문 확정」을 눌러주세요"}
          </div>
        )}
        <button
          onClick={async () => {
            const orderData = { tableNumber, items: cart, status: "pending", isPaid: false, createdAt: Date.now(), totalAmount: total };
            await onOrderSubmit(orderData);
            setMyOrders(prev => [...prev, { items: [...cart], total, time: Date.now() }]);
            alert(t.sent);
            setCart([]);
          }}
          disabled={!cart.length}
          className={`w-full py-4 rounded-2xl font-black text-xl shadow-xl flex justify-between px-6 min-h-[56px] transition-all ${cart.length > 0 ? "bg-orange-600 text-white" : "bg-gray-200 text-gray-400 shadow-none"}`}
        >
          <span>{t.confirmOrder}</span>
          <span>¥{total.toLocaleString()}</span>
        </button>
      </div>
    </div>
  );
};

/* ===========================================
   BILL VIEW（伝票管理 / スタッフ端末用）
   =========================================== */
const BillView = ({ orders, onCheckoutTable }) => {
  const [entered, setEntered] = useState(new Set());

  const tableGroups = useMemo(() => {
    const unpaid = orders.filter(o => !o.isPaid);
    const groups = {};
    unpaid.forEach(order => {
      const key = String(order.tableNumber);
      if (!groups[key]) groups[key] = { tableNumber: order.tableNumber, items: [], total: 0 };
      order.items.forEach(item => {
        const existing = groups[key].items.find(i => i.name === item.name && i.optionLabel === item.optionLabel);
        if (existing) existing.quantity += item.quantity;
        else groups[key].items.push({ ...item });
      });
      groups[key].total += order.totalAmount || 0;
    });
    return Object.values(groups).sort((a, b) => Number(a.tableNumber) - Number(b.tableNumber));
  }, [orders]);

  const toggleEntered = (tableNum) => {
    setEntered(prev => {
      const next = new Set(prev);
      if (next.has(String(tableNum))) next.delete(String(tableNum));
      else next.add(String(tableNum));
      return next;
    });
  };

  const grandTotal = tableGroups.reduce((s, g) => s + g.total, 0);

  return (
    <div className="h-full overflow-y-auto bg-gray-50 pb-8">
      <div className="sticky top-0 bg-white border-b px-4 py-3 z-10 shadow-sm">
        <div className="flex justify-between items-center">
          <h2 className="font-black text-lg text-gray-800 flex items-center">
            <FileText className="mr-2 text-orange-500" size={20} /> 伝票管理
            <span className="ml-2 text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-full">{tableGroups.length}テーブル</span>
          </h2>
          <div className="text-right">
            <div className="text-xs text-gray-400 font-bold">未会計合計</div>
            <div className="font-black text-orange-600 text-lg">¥{grandTotal.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {tableGroups.length === 0 ? (
          <div className="text-center text-gray-400 py-16 font-bold">
            <Receipt size={40} className="mx-auto mb-3 opacity-30" />
            未会計のテーブルはありません
          </div>
        ) : (
          tableGroups.map(group => {
            const isEntered = entered.has(String(group.tableNumber));
            return (
              <div key={group.tableNumber} className={`bg-white rounded-2xl shadow-sm border-l-4 overflow-hidden transition-all ${isEntered ? 'border-green-400' : 'border-orange-400'}`}>
                <div className={`flex justify-between items-center px-4 py-3 ${isEntered ? 'bg-green-50' : 'bg-orange-50'}`}>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-2xl text-gray-800">Table {group.tableNumber}</span>
                    {isEntered && <span className="text-xs bg-green-200 text-green-700 font-black px-2 py-0.5 rounded-full">入力済み</span>}
                  </div>
                  <span className="font-black text-xl text-orange-600">¥{group.total.toLocaleString()}</span>
                </div>
                <div className={`px-4 py-3 space-y-1.5 border-b border-gray-100 ${isEntered ? 'opacity-50' : ''}`}>
                  {group.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm text-gray-700">
                      <span className="font-bold">
                        {item.name}
                        {item.optionLabel ? <span className="text-blue-500 font-black text-xs ml-1">({item.optionLabel})</span> : ''}
                        <span className="text-gray-400 ml-1.5 font-bold">× {item.quantity}</span>
                      </span>
                      <span className="font-black text-gray-800">¥{((item.finalPrice || item.price) * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 px-4 py-3">
                  <button
                    onClick={() => toggleEntered(group.tableNumber)}
                    className={`flex-1 py-2.5 rounded-xl font-black text-sm flex items-center justify-center gap-1.5 min-h-[44px] transition active:scale-95 ${isEntered ? 'bg-green-100 text-green-700 border-2 border-green-300' : 'bg-gray-100 text-gray-600'}`}
                  >
                    <CheckCircle size={15} /> {isEntered ? '入力済み ✓' : 'レジ入力済み'}
                  </button>
                  <button
                    onClick={() => onCheckoutTable(group.tableNumber)}
                    className="flex-1 py-2.5 rounded-xl font-black text-sm bg-orange-500 text-white flex items-center justify-center gap-1.5 min-h-[44px] active:scale-95 transition"
                  >
                    <Receipt size={15} /> 会計完了
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

/* ===========================================
   HISTORY MODAL（注文履歴 / マスター専用）
   =========================================== */
const HistoryModal = ({ orders, onClose }) => {
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentOrders = orders
    .filter(o => o.createdAt >= sevenDaysAgo)
    .sort((a, b) => b.createdAt - a.createdAt);

  const grouped = recentOrders.reduce((acc, order) => {
    const dateKey = new Date(order.createdAt).toLocaleDateString('ja-JP', {
      year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short'
    });
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(order);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-[2rem] w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
        <div className="flex justify-between items-center p-5 border-b">
          <h2 className="font-black text-xl text-gray-800 flex items-center">
            <History className="mr-2 text-blue-600" size={22} /> 注文履歴（7日間）
          </h2>
          <button onClick={onClose} className="p-2 rounded-xl bg-gray-100 min-w-[44px] min-h-[44px] flex items-center justify-center">
            <X size={20} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-4 space-y-6">
          {Object.keys(grouped).length === 0 ? (
            <div className="text-center text-gray-400 py-12 font-bold">履歴がありません</div>
          ) : (
            Object.entries(grouped).map(([date, dayOrders]) => {
              const dayTotal = dayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
              return (
                <div key={date}>
                  <div className="flex justify-between items-center bg-gray-100 rounded-xl px-4 py-2 mb-3">
                    <span className="font-black text-gray-700">{date}</span>
                    <span className="font-black text-orange-600">合計 ¥{dayTotal.toLocaleString()}</span>
                  </div>
                  <div className="space-y-2">
                    {dayOrders.map(order => (
                      <div key={order.id} className={`rounded-xl p-3 border-l-4 ${order.isPaid ? 'border-green-400 bg-green-50' : 'border-orange-400 bg-orange-50'}`}>
                        <div className="flex justify-between items-center mb-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-black text-gray-700">Table {order.tableNumber}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${order.isPaid ? 'bg-green-200 text-green-700' : 'bg-orange-200 text-orange-700'}`}>
                              {order.isPaid ? '会計済' : '未会計'}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500 font-bold flex items-center">
                            <Clock size={12} className="mr-1" />
                            {new Date(order.createdAt).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 space-y-0.5">
                          {order.items.map((item, i) => (
                            <div key={i} className="flex justify-between">
                              <span>{item.name}{item.optionLabel ? ` (${item.optionLabel})` : ''} × {item.quantity}</span>
                              <span className="font-bold">¥{((item.price + (item.priceDiff || 0)) * item.quantity).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                        <div className="text-right font-black text-gray-700 mt-1 text-sm border-t pt-1">
                          ¥{(order.totalAmount || 0).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [view, setView] = useState("connect");
  const [role, setRole] = useState(null);
  const [showManageMenu, setShowManageMenu] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showBill, setShowBill] = useState(false);
  const [menuData, setMenuData] = useState(INITIAL_MENU_DATA);
  const [orders, setOrders] = useState([]);
  const [currentTable, setCurrentTable] = useState(null);

  const [lang, setLang] = useState(() => {
    if (typeof navigator !== "undefined" && navigator.language) return navigator.language.startsWith("ja") ? "ja" : "en";
    return "ja";
  });
  const toggleLang = () => setLang(LANG_ORDER[(LANG_ORDER.indexOf(lang) + 1) % LANG_ORDER.length]);
  const [showLangSelect, setShowLangSelect] = useState(false);

  // 🔔 新規注文の音通知用
  const knownOrderIds = useRef(null);
  const playOrderSound = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      [0, 150, 300].forEach((delay, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.value = i === 2 ? 880 : 660;
        gain.gain.setValueAtTime(0.4, ctx.currentTime + delay / 1000);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay / 1000 + 0.3);
        osc.start(ctx.currentTime + delay / 1000);
        osc.stop(ctx.currentTime + delay / 1000 + 0.3);
      });
    } catch (e) { /* 音声API非対応の場合は無視 */ }
  }, []);

  useEffect(() => {
    const unsubMenu = onSnapshot(collection(db, "menu"), (snapshot) => {
      if (snapshot.docs.length > 0) {
        setMenuData(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      }
    });
    const unsubOrders = onSnapshot(query(collection(db, "orders"), orderBy("createdAt", "asc")), (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      // 初回ロード時はIDを記録するだけ。2回目以降に新規注文を検出して音を鳴らす
      if (knownOrderIds.current === null) {
        knownOrderIds.current = new Set(docs.map(d => d.id));
      } else {
        const newOrders = docs.filter(d => !knownOrderIds.current.has(d.id));
        if (newOrders.length > 0) playOrderSound();
        knownOrderIds.current = new Set(docs.map(d => d.id));
      }
      setOrders(docs);
    });
    return () => { unsubMenu(); unsubOrders(); };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tableParam = params.get("table");
    if (tableParam && view === "connect") {
      setRole("guest");
      setCurrentTable(tableParam);
      setShowLangSelect(true); // 言語選択ポップアップを表示
    }
  }, [view]);

  const handleSaveMenuItem = async (item) => {
    try { await setDoc(doc(db, "menu", item.id), item); } catch (e) { alert("保存エラー: " + e.message); }
  };
  const handleDeleteMenuItem = async (id) => {
    try { await deleteDoc(doc(db, "menu", id)); } catch (e) { alert("削除エラー: " + e.message); }
  };
  const handleToggleSoldOut = async (item) => {
    try { await updateDoc(doc(db, "menu", item.id), { isSoldOut: !item.isSoldOut }); } catch (e) { alert("更新エラー: " + e.message); }
  };
  const handleOrderSubmit = async (data) => {
    try {
      await setDoc(doc(db, "orders", `ORD-${Date.now()}`), data);
      if (role !== "guest") setCurrentTable(null);
    } catch (e) { alert("注文エラー: " + e.message); }
  };
  const handleCheckoutTable = async (num) => {
    try {
      const tableOrders = orders.filter(o => String(o.tableNumber) === String(num) && !o.isPaid);
      for (const o of tableOrders) { await updateDoc(doc(db, "orders", o.id), { isPaid: true }); }
    } catch (e) { alert("会計エラー: " + e.message); }
  };
  const handleUpdateOrder = async (id, updates) => {
    try { await updateDoc(doc(db, "orders", id), updates); } catch (e) { alert("更新エラー: " + e.message); }
  };
  const handleDeleteOrder = async (id) => {
    try { await deleteDoc(doc(db, "orders", id)); } catch (e) { alert("削除エラー: " + e.message); }
  };

  // ▼ 初回限定データの流し込み用関数 ▼
  const handleInitializeDB = async () => {
    if (!window.confirm("約40件の初期メニューをクラウドに一括登録します。よろしいですか？\n（※既存データは上書きされます）")) return;
    let successCount = 0;
    const errors = [];
    for (const item of INITIAL_MENU_DATA) {
      try {
        const docRef = doc(db, "menu", item.id);
        await setDoc(docRef, { ...item, imageUrl: item.imageUrl || "", sortOrder: item.sortOrder || 100 });
        successCount++;
      } catch (e) {
        errors.push(`${item.name}: ${e.message}`);
      }
    }
    if (errors.length === 0) {
      alert(`✅ 全${successCount}件のメニューを復元しました！\nページを再読み込みして確認してください。`);
    } else {
      alert(`⚠️ ${successCount}件成功、${errors.length}件失敗:\n${errors.slice(0,3).join("\n")}\n\nFirestoreのルールを確認してください。`);
    }
  };

  // 🌐 ゲスト用言語選択ポップアップ
  if (showLangSelect)
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-900 p-8">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm text-center">
          <div className="text-4xl mb-4">🌐</div>
          <h2 className="text-2xl font-black text-gray-800 mb-2">言語を選んでください</h2>
          <p className="text-gray-400 text-sm mb-6">Please select your language</p>
          <div className="grid grid-cols-2 gap-3">
            {LANG_ORDER.map(l => (
              <button
                key={l}
                onClick={() => { setLang(l); setShowLangSelect(false); setView("order"); }}
                className="py-4 rounded-2xl font-black text-lg bg-orange-50 border-2 border-orange-200 text-orange-700 active:bg-orange-500 active:text-white transition"
              >
                {LANG_LABELS[l]}
              </button>
            ))}
          </div>
        </div>
      </div>
    );

  if (view === "connect")
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50 p-8 space-y-8 select-none">
        <div className="text-center">
          <h1 className="text-5xl font-black text-gray-800 tracking-tighter mb-2">
            Cloud <span className="text-orange-600 uppercase">POS</span>
          </h1>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Powered by Firebase</p>
        </div>
        <div className="w-full max-w-xs space-y-4">
          <button onClick={() => { setRole("host"); setView("tables"); }} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-xl shadow-xl min-h-[56px] flex items-center justify-center">
            <Monitor className="mr-3" /> 親機 (厨房管理)
          </button>
          <button onClick={() => { setRole("client"); setView("tables"); }} className="w-full bg-orange-500 text-white py-5 rounded-2xl font-black text-xl shadow-xl min-h-[56px] flex items-center justify-center">
            <Smartphone className="mr-3" /> 子機 (レジ入力)
          </button>
        </div>
        
        {/* 初回限定：データ流し込みボタン */}
        <button onClick={handleInitializeDB} className="mt-8 text-xs font-bold text-gray-400 underline active:text-orange-500 p-4">
          🚨 [初回限定] 初期メニューデータをクラウドに復元する
        </button>

      </div>
    );

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-white font-sans select-none">
      {showManageMenu && <ManageMenuModal lang={lang} onClose={() => setShowManageMenu(false)} menuData={menuData} onSave={handleSaveMenuItem} onDelete={handleDeleteMenuItem} onToggleSoldOut={handleToggleSoldOut} />}
      {showInvite && role === "host" && <InviteModal lang={lang} onClose={() => setShowInvite(false)} />}
      {showHistory && role === "host" && <HistoryModal orders={orders} onClose={() => setShowHistory(false)} />}
      {showBill && (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col">
          <div className="bg-gray-800 text-white p-3 flex justify-between items-center sticky top-0">
            <span className="font-black text-sm flex items-center gap-2"><FileText size={16} /> 伝票管理</span>
            <button onClick={() => setShowBill(false)} className="p-2 bg-gray-700 rounded-xl min-w-[44px] min-h-[44px] flex items-center justify-center"><X size={18} /></button>
          </div>
          <div className="flex-1 overflow-hidden">
            <BillView orders={orders} onCheckoutTable={async (num) => { await handleCheckoutTable(num); }} />
          </div>
        </div>
      )}

      {role !== "guest" && (
        <div className="bg-gray-800 text-white p-3 flex justify-between items-center text-xs sticky top-0 z-50">
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1.5 rounded-full font-black uppercase ${role === "host" ? "bg-blue-600" : "bg-orange-600"}`}>
              {role === "host" ? "Master" : "Terminal"}
            </span>
          </div>
          <div className="flex space-x-2 items-center">
            <button onClick={() => setView("kitchen")} className={`p-2 rounded-xl min-w-[44px] min-h-[44px] flex items-center justify-center transition ${view === "kitchen" ? "bg-orange-600" : "bg-gray-700"}`}><Utensils size={18} /></button>
            <button onClick={() => { setView("tables"); setCurrentTable(null); }} className={`p-2 rounded-xl min-w-[44px] min-h-[44px] flex items-center justify-center transition ${view === "tables" && !currentTable ? "bg-blue-600" : "bg-gray-700"}`}><Monitor size={18} /></button>
            <button onClick={() => setShowBill(true)} className="p-2 bg-orange-700 rounded-xl min-w-[44px] min-h-[44px] flex items-center justify-center relative">
              <FileText size={18} />
              {orders.filter(o => !o.isPaid).length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                  {[...new Set(orders.filter(o => !o.isPaid).map(o => o.tableNumber))].length}
                </span>
              )}
            </button>
            {role === "host" && (
              <>
                <button onClick={() => setShowInvite(true)} className="p-2 bg-gray-700 rounded-xl min-w-[44px] min-h-[44px] flex items-center justify-center"><Link size={18} /></button>
                <button onClick={() => setShowHistory(true)} className="p-2 bg-blue-700 rounded-xl min-w-[44px] min-h-[44px] flex items-center justify-center"><History size={18} /></button>
                <button onClick={() => setShowManageMenu(true)} className="p-2 bg-green-600 rounded-xl min-w-[44px] min-h-[44px] flex items-center justify-center shadow-lg"><Settings size={18} /></button>
              </>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-hidden relative">
        {view === "kitchen" ? (
          <KitchenView lang={lang} orders={orders} onUpdateOrder={async (id, u) => await updateDoc(doc(db, "orders", id), u)} />
        ) : !currentTable ? (
          <TableSelectionView lang={lang} onSelectTable={setCurrentTable} orders={orders} onCheckoutTable={handleCheckoutTable} onUpdateOrder={handleUpdateOrder} onDeleteOrder={handleDeleteOrder} />
        ) : (
          <OrderView lang={lang} menuData={menuData} tableNumber={currentTable} onBackToTables={() => setCurrentTable(null)} onOrderSubmit={handleOrderSubmit} isGuest={role === "guest"} toggleLang={toggleLang} />
        )}
      </div>
    </div>
  );
}
