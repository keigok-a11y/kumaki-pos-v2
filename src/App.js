import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import Peer from "peerjs";
import {
  Coffee,
  Utensils,
  ShoppingCart,
  Trash,
  CheckCircle,
  Plus,
  Minus,
  X,
  FileText,
  Square,
  AlertCircle,
  ChevronLeft,
  Settings,
  Users,
  Monitor,
  Smartphone,
  Link,
  Share2,
  RefreshCw,
  Download,
  Edit,
  Clock,
  Save,
  DollarSign,
  Languages,
  UserPlus,
  Pencil,
  QrCode,
  Receipt, // アイコン追加
} from "lucide-react";

/* ===========================================
   CONSTANTS & DATA
   ===========================================
*/

const CATEGORY_TRANSLATIONS = {
  "１、アルコール": "Alcohol",
  "２、テキーラ": "Tequila",
  "３、ソフトドリンク": "Soft Drinks",
  "４、タコス": "Tacos",
  "５、サラダ": "Salad",
  "６、サイドメニュー＆小皿": "Sides & Tapas",
  "７、ライス": "Rice",
  "８、その他": "Others",
  ALL: "ALL",
};

const CHARGE_ITEM = {
  id: "SERVICE_CHARGE_300",
  name: "チャージ料",
  nameEn: "Table Charge",
  price: 300,
  category: "８、その他",
  options: [],
  optionsEn: [],
};

// ユーザー様ご指定の初期データ
const INITIAL_MENU_DATA = [
  {
    id: "Z6SForpMTyQkWXGRjPtE",
    category: "１、アルコール",
    price: 790,
    name: "コロナ",
    nameEn: "Corona Beer",
    isSoldOut: false,
    options: [],
    optionsEn: [],
  },
  {
    id: "hXQsSVsPyV33BZR7yY4d",
    price: 750,
    name: "ハイネケン",
    nameEn: "Heineken",
    category: "１、アルコール",
    options: [],
    optionsEn: [],
    isSoldOut: false,
  },
  {
    id: "zwYIoh8KOR9mIpiPSqA2",
    name: "ハイボール（角）",
    nameEn: "Highball (Suntory Kaku)",
    isSoldOut: false,
    options: [],
    optionsEn: [],
    price: 600,
    category: "１、アルコール",
  },
  {
    id: "olkrbdbBbQZkJFNUVK93",
    price: 700,
    category: "１、アルコール",
    isSoldOut: false,
    name: "ハウスワイン赤",
    nameEn: "House Wine (Red)",
    options: [],
    optionsEn: [],
  },
  {
    id: "bFZLWaZYwPP8BlH2kiG8",
    options: [],
    optionsEn: [],
    name: "ハウスワイン白",
    nameEn: "House Wine (White)",
    price: 700,
    isSoldOut: false,
    category: "１、アルコール",
  },
  {
    id: "2bpnlxhajlb3xCGTCUBT",
    isSoldOut: false,
    category: "２、テキーラ",
    name: "A,(1800)セン・オチョシエント・アネホ・レゼルバ(熟成）",
    nameEn: "1800 Añejo Reserva",
    price: 1200,
    options: [
      "ハイボール",
      "ハーフロック",
      "ロック",
      "ストレート",
      "トニック割：+50",
    ],
    optionsEn: [
      "Highball",
      "Half Rock",
      "On the Rocks",
      "Straight",
      "with Tonic: +50",
    ],
  },
  {
    id: "P0edpG0zoS9rDtCLe9bE",
    category: "２、テキーラ",
    price: 1500,
    name: "A,ドンフリオ・アニェホ（熟成）",
    nameEn: "Don Julio Añejo",
    isSoldOut: false,
    options: [
      "ハイボール",
      "ハーフロック",
      "ロック",
      "ストレート",
      "トニック割：+50",
    ],
    optionsEn: [
      "Highball",
      "Half Rock",
      "On the Rocks",
      "Straight",
      "with Tonic: +50",
    ],
  },
  {
    id: "75xAC6MTnjRl61kV6SDm",
    category: "２、テキーラ",
    name: "B,チャムコス・ブランコ",
    nameEn: "Chamucos Blanco",
    price: 1200,
    isSoldOut: false,
    options: [
      "ハイボール",
      "ハーフロック",
      "ロック",
      "ストレート",
      "トニック割：+50",
    ],
    optionsEn: [
      "Highball",
      "Half Rock",
      "On the Rocks",
      "Straight",
      "with Tonic: +50",
    ],
  },
  {
    id: "WA2r531CqJFRHTDdT0jl",
    price: 900,
    category: "２、テキーラ",
    name: "B、ドン・フリオ・ブランコ",
    nameEn: "Don Julio Blanco",
    isSoldOut: false,
    options: [
      "ハイボール",
      "ハーフロック",
      "ロック",
      "ストレート",
      "トニック割：+50",
    ],
    optionsEn: [
      "Highball",
      "Half Rock",
      "On the Rocks",
      "Straight",
      "with Tonic: +50",
    ],
  },
  {
    id: "bAc5CjWwvvDH0RU8fYcy",
    price: 900,
    name: "R,エスポロン・テキーラ・レポサド",
    nameEn: "Espolón Reposado",
    category: "２、テキーラ",
    isSoldOut: false,
    options: [
      "ハイボール",
      "ハーフロック",
      "ロック",
      "ストレート",
      "トニック割：+50",
    ],
    optionsEn: [
      "Highball",
      "Half Rock",
      "On the Rocks",
      "Straight",
      "with Tonic: +50",
    ],
  },
  {
    id: "sO7BJUMqcPZJsT1fESmv",
    options: [],
    optionsEn: [],
    isSoldOut: false,
    category: "３、ソフトドリンク",
    price: 500,
    name: "オレンジジュース",
    nameEn: "Orange Juice",
  },
  {
    id: "rKidkeBTk97nGmq9AV8o",
    isSoldOut: false,
    category: "３、ソフトドリンク",
    price: 500,
    options: [],
    optionsEn: [],
    name: "コーラー",
    nameEn: "Coca Cola",
  },
  {
    id: "IUWTpu2sQR0ugxQxhMjm",
    options: [],
    optionsEn: [],
    name: "烏龍茶",
    nameEn: "Oolong Tea",
    category: "３、ソフトドリンク",
    isSoldOut: false,
    price: 500,
  },
  {
    id: "W6DgMzIPiPLH5ON7XgHe",
    price: 1780,
    isSoldOut: false,
    name: "１、タコス３種盛り",
    nameEn: "3 Tacos Platter",
    category: "４、タコス",
    options: [],
    optionsEn: [],
  },
  {
    id: "waFFM8URVrQR0AJ1Nsmf",
    isSoldOut: false,
    options: [],
    optionsEn: [],
    price: 520,
    category: "４、タコス",
    name: "2,カルニータス(タコス）",
    nameEn: "Carnitas Taco",
  },
  {
    id: "pwsdDEhcZuTfbUqUzx2E",
    options: [],
    optionsEn: [],
    price: 820,
    name: "3,牛タンのレングア（タコス）",
    nameEn: "Beef Tongue Taco",
    category: "４、タコス",
    isSoldOut: false,
  },
  {
    id: "rUBkfCVHJn4LGQExYX0q",
    isSoldOut: false,
    price: 820,
    name: "4,和牛のカルネ・アサーダ（タコス）",
    nameEn: "Wagyu Carne Asada Taco",
    category: "４、タコス",
    options: [],
    optionsEn: [],
  },
  {
    id: "ikLXUQkB4IRnsTJzN28t",
    options: [],
    optionsEn: [],
    name: "５、海老アボカド（タコス）",
    nameEn: "Shrimp & Avocado Taco",
    category: "４、タコス",
    price: 670,
    isSoldOut: false,
  },
  {
    id: "S3HpIm8w8jNCeCobzk8I",
    name: "1,春菊のライムサラダ",
    nameEn: "Shungiku Lime Salad",
    category: "５、サラダ",
    price: 810,
    isSoldOut: false,
    options: ["フルサイズ", "ハーフサイズ：-200"],
    optionsEn: ["Full Size", "Half Size: -200"],
  },
  {
    id: "0dudLzhoreR7n6G2WwLm",
    name: "２、ノパル入りグリーンサラダ",
    nameEn: "Green Salad with Nopal",
    price: 750,
    isSoldOut: false,
    category: "５、サラダ",
    options: ["フルサイズ", "ハーフサイズ：-200"],
    optionsEn: ["Full Size", "Half Size: -200"],
  },
  {
    id: "5SxEJEWXvcRffBe0zMMX",
    options: [],
    optionsEn: [],
    category: "６、サイドメニュー＆小皿",
    price: 350,
    isSoldOut: false,
    name: "おつまみケサディーヤ１枚",
    nameEn: "Quesadilla (1pc)",
  },
  {
    id: "du5KtMdFJqBxM1DVy5Lm",
    name: "おつまみレングア",
    nameEn: "Beef Tongue Appetizer",
    isSoldOut: false,
    options: [],
    optionsEn: [],
    price: 560,
    category: "６、サイドメニュー＆小皿",
  },
  {
    id: "slSx6yaiNOwATE2cWAoX",
    isSoldOut: false,
    price: 680,
    options: [],
    optionsEn: [],
    category: "６、サイドメニュー＆小皿",
    name: "サルサで食べるオイルサーディン",
    nameEn: "Oil Sardines with Salsa",
  },
  {
    id: "Mr4wHMA2tyJgZI7vZ4fq",
    options: [],
    optionsEn: [],
    isSoldOut: false,
    name: "サルサで食べるトルティーヤチップス",
    nameEn: "Tortilla Chips with Salsa",
    price: 530,
    category: "６、サイドメニュー＆小皿",
  },
  {
    id: "A1YdpNmwW2o7y846qJ7p",
    isSoldOut: false,
    price: 710,
    name: "ジョロキアソーセージ（5本）",
    nameEn: "Ghost Pepper Sausage (5pcs)",
    category: "６、サイドメニュー＆小皿",
    options: [],
    optionsEn: [],
  },
  {
    id: "VOG5hgxtfKu3iNLGE0kd",
    category: "６、サイドメニュー＆小皿",
    name: "チチャロン",
    nameEn: "Chicharron",
    price: 500,
    isSoldOut: false,
    options: [],
    optionsEn: [],
  },
  {
    id: "c4Ps6AADdT9NZtur6181",
    name: "ハラペーニョ",
    nameEn: "Jalapeño",
    isSoldOut: false,
    options: [],
    optionsEn: [],
    price: 300,
    category: "６、サイドメニュー＆小皿",
  },
  {
    id: "EM6WBsxrQuRy7gF5maPM",
    options: [],
    optionsEn: [],
    isSoldOut: false,
    category: "６、サイドメニュー＆小皿",
    price: 780,
    name: "海老のイカのアドボ",
    nameEn: "Shrimp & Squid Adobo",
  },
  {
    id: "lPkiIMFzAuWNCMLiLHYt",
    category: "６、サイドメニュー＆小皿",
    price: 680,
    options: [],
    optionsEn: [],
    name: "平飼い卵のベーコンエッグ",
    nameEn: "Free-range Bacon & Eggs",
    isSoldOut: false,
  },
  {
    id: "nZnQ1KALECqRnT4vMW13",
    name: "１、カルニータス・ライス",
    nameEn: "Carnitas Rice",
    price: 1350,
    isSoldOut: false,
    category: "７、ライス",
    options: ["普通もり", "大盛り:+150"],
    optionsEn: ["Regular", "Large: +150"],
  },
  {
    id: "z4wlsaUCrY39VFCMCe1E",
    price: 1420,
    isSoldOut: false,
    category: "７、ライス",
    name: "２、牛タンのレングアライス",
    nameEn: "Beef Tongue Rice",
    options: ["普通盛り", "大盛り：+150"],
    optionsEn: ["Regular", "Large: +150"],
  },
  {
    id: "noQSh4ZDTbgW7NQl2FPB",
    category: "７、ライス",
    name: "３、和牛の焼肉ライス",
    nameEn: "Wagyu Yakiniku Rice",
    price: 1270,
    isSoldOut: false,
    options: ["普通盛り", "大盛り：+150"],
    optionsEn: ["Regular", "Large: +150"],
  },
];

const parseOption = (optionStr) => {
  if (!optionStr) return { label: "", priceDiff: 0 };
  const regex = /^(.*?)(?:[:：]([+\-]?\d+))?$/;
  const match = optionStr.match(regex);
  if (match) {
    return {
      label: match[1].trim(),
      priceDiff: match[2] ? parseInt(match[2], 10) : 0,
    };
  }
  return { label: optionStr, priceDiff: 0 };
};

const TRANSLATIONS = {
  ja: {
    back: "戻る",
    confirmOrder: "注文確定",
    addMenu: "メニュー追加",
    editMenu: "メニュー編集",
    itemLabel: "商品名",
    itemEnLabel: "英語名",
    priceLabel: "価格",
    categoryLabel: "カテゴリ",
    save: "保存する",
    kitchen: "厨房オーダー",
    tables: "テーブル選択",
    done: "提供完了",
    sent: "注文を送信しました",
    addCharge: "チャージ料追加",
    guests: "名様分",
    cancel: "閉じる",
    inviteTitle: "接続用QRコード",
    inviteMsg: "端末で読み取ってください",
    copyLink: "URLをコピー",
    manageMenu: "メニュー管理",
    createNew: "新規作成モード",
    staffLink: "スタッフ用 (全機能)",
    guestLink: "客席用 (注文のみ)",
  },
  en: {
    back: "Back",
    confirmOrder: "Order",
    addMenu: "Add Item",
    editMenu: "Edit Item",
    itemLabel: "Item Name",
    itemEnLabel: "English Name",
    priceLabel: "Price",
    categoryLabel: "Category",
    save: "Save",
    kitchen: "Kitchen",
    tables: "Tables",
    done: "Served",
    sent: "Order Sent!",
    addCharge: "Add Charge",
    guests: "Guests",
    cancel: "Close",
    inviteTitle: "Connect QR",
    inviteMsg: "Scan with device",
    copyLink: "Copy Link",
    manageMenu: "Manage Menu",
    createNew: "Create New",
    staffLink: "For Staff (Full Access)",
    guestLink: "For Guest (Order Only)",
  },
};

/* ===========================================
   COMPONENTS
   ===========================================
*/

// --- 伝票詳細モーダル (新規追加: レジ入力用) ---
const TableDetailModal = ({
  tableNumber,
  orders,
  onClose,
  onCheckout,
  lang,
}) => {
  // テーブルの未会計注文を抽出
  const tableOrders = orders.filter(
    (o) =>
      String(o.tableNumber) === String(tableNumber) && !o.isPaid && !o.isDeleted
  );

  // 商品を集約（同じ商品はまとめる）
  const aggregatedItems = [];
  tableOrders.forEach((order) => {
    order.items.forEach((item) => {
      const existing = aggregatedItems.find((i) => i.cartId === item.cartId);
      if (existing) {
        existing.quantity += item.quantity;
      } else {
        aggregatedItems.push({ ...item }); // コピーをpush
      }
    });
  });

  const totalAmount = tableOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[150] p-4 backdrop-blur-md">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-orange-500 text-white p-4 flex justify-between items-center">
          <h3 className="font-black text-xl flex items-center">
            <Receipt className="mr-2" /> Table {tableNumber}
          </h3>
          <button onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
            注文リスト (レジ入力用)
          </p>
          {aggregatedItems.map((item, idx) => (
            <div
              key={idx}
              className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm border border-gray-100"
            >
              <div className="flex-1">
                <div className="font-bold text-gray-800 text-sm">
                  {lang === "en" ? item.nameEn || item.name : item.name}
                </div>
                {item.optionLabel && (
                  <div className="text-[10px] text-blue-500 font-black bg-blue-50 inline-block px-1.5 rounded">
                    {item.optionLabel}
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-3">
                <span className="font-black text-gray-400 text-xs">
                  x{item.quantity}
                </span>
                <span className="font-black text-gray-800">
                  ¥{(item.finalPrice * item.quantity).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
          {aggregatedItems.length === 0 && (
            <div className="text-center text-gray-400 py-10 font-bold">
              注文はありません
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t-2 border-gray-100">
          <div className="flex justify-between items-end mb-4">
            <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">
              Total
            </span>
            <span className="text-3xl font-black text-orange-600">
              ¥{totalAmount.toLocaleString()}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onClose}
              className="py-3 bg-gray-100 text-gray-500 rounded-xl font-black text-sm"
            >
              閉じる
            </button>
            <button
              onClick={() => {
                if (
                  window.confirm(
                    `${tableNumber}卓を会計済みにしますか？\n（レジへの入力が完了しているか確認してください）`
                  )
                )
                  onCheckout(tableNumber);
              }}
              className="py-3 bg-blue-600 text-white rounded-xl font-black text-sm shadow-lg shadow-blue-200 active:scale-95 transition"
            >
              会計済み (クリア)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- メニュー管理モーダル ---
const ManageMenuModal = ({ onClose, menuData, onSave, onDelete, lang }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [name, setName] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("８、その他");
  const t = TRANSLATIONS[lang];

  const categories = useMemo(() => {
    const cats = new Set(INITIAL_MENU_DATA.map((m) => m.category));
    menuData.forEach((m) => cats.add(m.category));
    return [...cats].sort();
  }, [menuData]);

  const resetForm = () => {
    setIsEditing(false);
    setCurrentId(null);
    setName("");
    setNameEn("");
    setPrice("");
    setCategory("８、その他");
  };

  const handleEdit = (item) => {
    setIsEditing(true);
    setCurrentId(item.id);
    setName(item.name);
    setNameEn(item.nameEn || "");
    setPrice(item.price);
    setCategory(item.category);
    document
      .getElementById("manage-form")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !price) return;

    const originalItem = menuData.find((m) => m.id === currentId);

    const newItem = {
      id: currentId || "PROD_" + Date.now(),
      name,
      nameEn: nameEn || name,
      price: parseInt(price),
      category,
      isSoldOut: originalItem ? originalItem.isSoldOut : false,
      options: originalItem ? originalItem.options : [],
      optionsEn: originalItem ? originalItem.optionsEn : [],
    };
    onSave(newItem);
    resetForm();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[200] p-4 backdrop-blur-md">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom duration-300">
        <div className="bg-gray-800 text-white p-4 flex justify-between items-center sticky top-0 z-10">
          <h3 className="font-black text-lg flex items-center">
            <Settings size={20} className="mr-2" />
            {t.manageMenu}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth bg-gray-50">
          <form
            id="manage-form"
            onSubmit={handleSubmit}
            className="bg-white p-5 rounded-2xl border-2 border-blue-100 shadow-sm space-y-4"
          >
            <h4 className="font-black text-gray-800 border-b-2 border-gray-100 pb-2 mb-2 flex justify-between items-center">
              {isEditing ? t.editMenu : t.addMenu}
              {isEditing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded-full border border-blue-200 font-bold"
                >
                  {t.createNew}
                </button>
              )}
            </h4>
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-[10px] font-black text-gray-400 mb-1 uppercase tracking-widest">
                  {t.itemLabel}
                </label>
                <input
                  className="w-full border-2 border-gray-100 p-3 rounded-xl font-bold focus:border-blue-500 outline-none"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="日本語名"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 mb-1 uppercase tracking-widest">
                  {t.itemEnLabel}
                </label>
                <input
                  className="w-full border-2 border-gray-100 p-3 rounded-xl font-bold focus:border-blue-500 outline-none"
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  placeholder="English Name"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 mb-1 uppercase tracking-widest">
                    {t.priceLabel}
                  </label>
                  <input
                    type="number"
                    className="w-full border-2 border-gray-100 p-3 rounded-xl font-bold focus:border-blue-500 outline-none"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 mb-1 uppercase tracking-widest">
                    {t.categoryLabel}
                  </label>
                  <select
                    className="w-full border-2 border-gray-100 p-3 rounded-xl font-bold bg-white focus:border-blue-500 outline-none text-sm"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {lang === "en" ? CATEGORY_TRANSLATIONS[c] || c : c}
                      </option>
                    ))}
                    <option value="８、その他">８、その他</option>
                  </select>
                </div>
              </div>
            </div>
            <button
              type="submit"
              className={`w-full py-3 rounded-xl font-black text-lg shadow-lg transition-all active:scale-95 ${
                isEditing
                  ? "bg-orange-500 shadow-orange-100"
                  : "bg-blue-600 shadow-blue-100"
              } text-white`}
            >
              {isEditing ? t.save : t.addMenu}
            </button>
          </form>

          <div className="space-y-3 pb-10">
            <h4 className="font-black text-gray-400 text-xs uppercase tracking-widest px-2">
              登録済みアイテム ({menuData.length})
            </h4>
            {menuData.map((item) => (
              <div
                key={item.id}
                className={`flex justify-between items-center p-3 bg-white border-2 rounded-xl transition-all shadow-sm ${
                  currentId === item.id
                    ? "border-orange-400 bg-orange-50"
                    : "border-gray-100"
                }`}
              >
                <div className="flex-1 overflow-hidden">
                  <div className="font-bold text-gray-800 truncate text-sm">
                    {item.name}
                  </div>
                  {item.nameEn && (
                    <div className="text-xs text-gray-400 truncate">
                      {item.nameEn}
                    </div>
                  )}
                  <div className="text-xs text-blue-600 font-black mt-1">
                    ･{item.price.toLocaleString()}{" "}
                    <span className="text-gray-300 ml-1 text-[10px] uppercase font-normal">
                      {item.category}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2 ml-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-2 bg-gray-50 text-gray-500 rounded-lg hover:bg-orange-100 hover:text-orange-600 transition-colors"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm("本当に削除しますか？"))
                        onDelete(item.id);
                    }}
                    className="p-2 bg-gray-50 text-gray-500 rounded-lg hover:bg-red-100 hover:text-red-600 transition-colors"
                  >
                    <Trash size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- 招待用モーダル ---
const InviteModal = ({ hostId, onClose, lang }) => {
  const [copied, setCopied] = useState(false);
  const [targetTable, setTargetTable] = useState("STAFF");
  const t = TRANSLATIONS[lang];

  const inviteUrl = `${window.location.origin}${
    window.location.pathname
  }?join=${hostId}${targetTable !== "STAFF" ? `&table=${targetTable}` : ""}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
    inviteUrl
  )}&ecc=H`;

  const handleCopy = () => {
    const el = document.createElement("textarea");
    el.value = inviteUrl;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[200] p-4 backdrop-blur-md">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden p-6 text-center animate-in zoom-in duration-300">
        <h3 className="font-black text-xl text-gray-800 mb-2">
          {t.inviteTitle}
        </h3>

        <div className="flex bg-gray-100 p-1 rounded-xl mb-4">
          <button
            onClick={() => setTargetTable("STAFF")}
            className={`flex-1 py-2 rounded-lg text-xs font-black transition ${
              targetTable === "STAFF"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-400"
            }`}
          >
            {t.staffLink}
          </button>
          <button
            onClick={() => setTargetTable("1")}
            className={`flex-1 py-2 rounded-lg text-xs font-black transition ${
              targetTable !== "STAFF"
                ? "bg-white text-orange-600 shadow-sm"
                : "text-gray-400"
            }`}
          >
            {t.guestLink}
          </button>
        </div>

        {targetTable !== "STAFF" && (
          <div className="mb-4">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
              テーブル番号を選択
            </p>
            <div className="flex overflow-x-auto space-x-2 pb-2 scrollbar-hide">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
                <button
                  key={n}
                  onClick={() => setTargetTable(String(n))}
                  className={`w-10 h-10 rounded-full font-black flex-shrink-0 border-2 transition ${
                    String(n) === targetTable
                      ? "bg-orange-500 border-orange-500 text-white"
                      : "bg-white border-gray-200 text-gray-400"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white p-4 border-4 border-gray-50 rounded-2xl shadow-inner mb-6 flex flex-col justify-center items-center">
          <img
            src={qrCodeUrl}
            alt="QR"
            className="w-48 h-48 object-contain mix-blend-multiply"
          />

          {targetTable !== "STAFF" && (
            <div className="mt-3 bg-orange-50 px-6 py-2 rounded-xl font-black text-xl text-orange-600 border-2 border-orange-100 shadow-sm">
              Table <span className="text-2xl ml-1">{targetTable}</span>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <button
            onClick={handleCopy}
            className={`w-full py-3 rounded-xl font-black text-base flex items-center justify-center transition-all ${
              copied
                ? "bg-green-500 text-white"
                : "bg-blue-600 text-white shadow-lg active:scale-95"
            }`}
          >
            {copied ? (
              <CheckCircle className="mr-2" size={18} />
            ) : (
              <Link className="mr-2" size={18} />
            )}
            {copied ? "COPIED!" : t.copyLink}
          </button>
          <button
            onClick={onClose}
            className="w-full py-2 text-gray-400 font-bold hover:text-gray-600 transition-colors uppercase tracking-widest text-xs"
          >
            {t.cancel}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- チャージ料用モーダル ---
const ChargeModal = ({ onClose, onConfirm, lang }) => {
  const t = TRANSLATIONS[lang];
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[110] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in duration-200">
        <div className="bg-purple-600 text-white p-4 flex justify-between items-center">
          <h3 className="font-bold flex items-center">
            <UserPlus className="mr-2" />
            {t.addCharge}
          </h3>
          <button onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        <div className="p-6">
          <p className="text-gray-500 text-sm mb-4 font-bold text-center">
            人数を選んでください (･300/人)
          </p>
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <button
                key={n}
                onClick={() => onConfirm(n)}
                className="aspect-square bg-gray-100 rounded-xl font-black text-xl hover:bg-purple-100 transition-colors border-2 border-transparent hover:border-purple-300"
              >
                {n}
              </button>
            ))}
          </div>
          <button
            onClick={onClose}
            className="w-full mt-6 py-3 text-gray-400 font-bold tracking-widest text-xs uppercase"
          >
            {t.cancel}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- オプション選択モーダル ---
const OptionModal = ({ item, onClose, onConfirm, lang }) => {
  const displayOptions =
    lang === "en" && item.optionsEn?.length ? item.optionsEn : item.options;
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[110] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in duration-200">
        <div className="bg-orange-500 text-white p-5 font-black text-xl">
          {lang === "en" ? item.nameEn || item.name : item.name}
        </div>
        <div className="p-4 space-y-2">
          {displayOptions.map((opt, i) => {
            const parsed = parseOption(opt);
            return (
              <button
                key={i}
                onClick={() => onConfirm(item, opt)}
                className="w-full py-4 px-5 bg-gray-50 border-2 border-gray-100 rounded-2xl font-black text-lg active:bg-orange-100 flex justify-between items-center transition"
              >
                <span>{parsed.label}</span>
                {parsed.priceDiff !== 0 && (
                  <span className="text-sm text-blue-600">
                    +{parsed.priceDiff}円
                  </span>
                )}
              </button>
            );
          })}
          <button
            onClick={onClose}
            className="w-full py-4 text-gray-400 font-bold tracking-widest text-xs uppercase"
          >
            戻る
          </button>
        </div>
      </div>
    </div>
  );
};

// --- テーブル選択画面 (修正: 詳細モーダルを開くロジックを追加) ---
const TableSelectionView = ({
  onSelectTable,
  orders,
  onCheckoutTable,
  lang,
}) => {
  const [detailTable, setDetailTable] = useState(null); // 詳細表示中のテーブル番号
  const t = TRANSLATIONS[lang];

  const tableStatus = useMemo(() => {
    const s = {};
    orders.forEach((o) => {
      if (!o.isPaid && !o.isDeleted) {
        const k = String(o.tableNumber);
        if (!s[k]) s[k] = { total: 0 };
        s[k].total += o.totalAmount;
      }
    });
    return s;
  }, [orders]);

  return (
    <>
      {/* 伝票詳細モーダル */}
      {detailTable && (
        <TableDetailModal
          tableNumber={detailTable}
          orders={orders}
          lang={lang}
          onClose={() => setDetailTable(null)}
          onCheckout={(num) => {
            onCheckoutTable(num);
            setDetailTable(null);
          }}
        />
      )}

      <div className="p-4 grid grid-cols-3 gap-4 overflow-y-auto h-full bg-gray-50 pb-24">
        {Array.from({ length: 12 }, (_, i) => String(i + 1)).map((num) => (
          <button
            key={num}
            onClick={() => {
              // 注文がある場合は詳細モーダルを開く、ない場合はテーブル選択(注文追加)へ
              if (tableStatus[num]) {
                setDetailTable(num);
              } else onSelectTable(num);
            }}
            className={`h-24 rounded-[2rem] border-4 flex flex-col items-center justify-center font-black transition-all active:scale-95 ${
              tableStatus[num]
                ? "bg-orange-50 border-orange-500 text-orange-700 shadow-xl shadow-orange-100"
                : "bg-white border-gray-100 text-gray-300 shadow-md shadow-gray-100"
            }`}
          >
            <span className="text-3xl">{num}</span>
            {tableStatus[num] && (
              <span className="text-[10px] font-black bg-orange-500 text-white px-2 py-0.5 rounded-full mt-1 border border-white">
                ･{tableStatus[num].total.toLocaleString()}
              </span>
            )}
          </button>
        ))}
      </div>
    </>
  );
};

// --- キッチン画面 ---
const KitchenView = ({ orders, onUpdateOrder, lang }) => {
  const t = TRANSLATIONS[lang];
  return (
    <div className="p-4 space-y-4 bg-gray-900 h-full overflow-y-auto pb-24 font-sans">
      <h2 className="text-white text-2xl font-black flex items-center mb-6 tracking-tight">
        <Utensils className="mr-3" size={28} />
        {t.kitchen}
      </h2>
      {orders
        .filter((o) => o.status === "pending" && !o.isDeleted)
        .map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-[2.5rem] p-6 shadow-2xl border-l-[12px] border-red-500 animate-in slide-in-from-right duration-300"
          >
            <div className="flex justify-between items-center border-b-2 border-gray-50 pb-4 mb-4">
              <span className="font-black text-4xl text-gray-800">
                {order.tableNumber}
                <span className="text-xs ml-1 text-gray-400 font-bold uppercase tracking-widest">
                  Table
                </span>
              </span>
              <span className="text-xs text-gray-400 font-black bg-gray-50 px-2 py-1 rounded-lg">
                {new Date(order.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <div className="space-y-4 mb-6">
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-start border-b border-gray-50 pb-2 border-dashed last:border-0"
                >
                  <div className="flex-1">
                    <div className="font-black text-xl text-gray-800 leading-tight">
                      {lang === "en" ? item.nameEn || item.name : item.name}
                    </div>
                    {item.optionLabel && (
                      <div className="text-xs font-black text-blue-600 mt-1 uppercase tracking-wider bg-blue-50 inline-block px-2 rounded-full">
                        {item.optionLabel}
                      </div>
                    )}
                  </div>
                  <div className="font-black text-3xl text-orange-600 ml-4">
                    x{item.quantity}
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => onUpdateOrder(order.id, { status: "completed" })}
              className="w-full bg-green-600 text-white py-5 rounded-[1.5rem] font-black text-xl active:scale-[0.98] transition flex items-center justify-center shadow-xl shadow-green-100 hover:bg-green-700 active:shadow-inner"
            >
              <CheckCircle className="mr-2" size={24} /> {t.done}
            </button>
          </div>
        ))}
      {orders.filter((o) => o.status === "pending" && !o.isDeleted).length ===
        0 && (
        <div className="text-gray-600 font-black text-center py-32 uppercase tracking-widest opacity-30 italic">
          No Orders
        </div>
      )}
    </div>
  );
};

// --- 注文画面 ---
const OrderView = ({
  menuData,
  tableNumber,
  onBackToTables,
  onOrderSubmit,
  lang,
  isGuest,
}) => {
  const [cart, setCart] = useState([]);
  const [activeCat, setActiveCat] = useState("ALL");
  const [optItem, setOptItem] = useState(null);
  const [showCharge, setShowCharge] = useState(false);
  const t = TRANSLATIONS[lang];
  const categories = useMemo(() => {
    const cats = new Set(menuData.map((i) => i.category));
    return ["ALL", ...Array.from(cats).sort()];
  }, [menuData]);

  const addToCart = (item, optStr = null) => {
    const parsed = optStr ? parseOption(optStr) : { label: "", priceDiff: 0 };
    const finalPrice = item.price + parsed.priceDiff;
    const cartId = optStr ? `${item.id}-${optStr}` : item.id;

    setCart((prev) => {
      const idx = prev.findIndex((i) => i.cartId === cartId);
      if (idx > -1) {
        return prev.map((i) =>
          i.cartId === cartId ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          cartId,
          id: item.id,
          name: item.name,
          nameEn: item.nameEn,
          finalPrice,
          optionLabel: parsed.label,
          quantity: 1,
        },
      ];
    });
    setOptItem(null);
  };

  const removeFromCart = (cartId) => {
    setCart((prev) =>
      prev.reduce((acc, i) => {
        if (i.cartId === cartId)
          return i.quantity > 1
            ? [...acc, { ...i, quantity: i.quantity - 1 }]
            : acc;
        return [...acc, i];
      }, [])
    );
  };

  const addCharge = (count) => {
    for (let i = 0; i < count; i++) addToCart(CHARGE_ITEM);
    setShowCharge(false);
  };

  const total = cart.reduce((s, i) => s + i.finalPrice * i.quantity, 0);

  return (
    <div className="h-screen flex flex-col bg-white">
      {optItem && (
        <OptionModal
          item={optItem}
          lang={lang}
          onClose={() => setOptItem(null)}
          onConfirm={addToCart}
        />
      )}
      {showCharge && (
        <ChargeModal
          lang={lang}
          onClose={() => setShowCharge(false)}
          onConfirm={addCharge}
        />
      )}

      <div className="p-4 bg-blue-600 text-white flex justify-between items-center shadow-lg sticky top-0 z-50">
        {!isGuest ? (
          <button
            onClick={onBackToTables}
            className="font-black flex items-center active:scale-95 transition text-sm bg-blue-700 px-3 py-1.5 rounded-xl"
          >
            <ChevronLeft size={18} className="mr-1" />
            {t.back}
          </button>
        ) : (
          <div className="text-xs font-black bg-blue-700 px-2 py-1 rounded-lg">
            GUEST MODE
          </div>
        )}

        <div className="font-black text-2xl tracking-tight">
          {tableNumber}
          <span className="text-[10px] ml-1 opacity-60">卓</span>
        </div>

        {!isGuest ? (
          <button
            onClick={() => setShowCharge(true)}
            className="p-2 bg-purple-700 rounded-xl active:scale-90 transition shadow-lg shadow-purple-900/30"
          >
            <UserPlus size={20} />
          </button>
        ) : (
          <div className="w-8"></div>
        )}
      </div>

      <div className="flex overflow-x-auto p-3 space-x-2 border-b bg-gray-50 scrollbar-hide sticky top-[64px] z-40 shadow-sm">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setActiveCat(c)}
            className={`px-4 py-2 rounded-full text-xs font-black whitespace-nowrap transition active:scale-95 ${
              activeCat === c
                ? "bg-orange-500 text-white shadow-lg shadow-orange-100"
                : "bg-white text-gray-400 border border-gray-100"
            }`}
          >
            {lang === "en" ? CATEGORY_TRANSLATIONS[c] || c : c}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3 grid grid-cols-2 gap-3 pb-52">
        {menuData
          .filter((i) => activeCat === "ALL" || i.category === activeCat)
          .map((item) => (
            <button
              key={item.id}
              onClick={() =>
                item.options?.length > 0 ? setOptItem(item) : addToCart(item)
              }
              className="h-32 border-4 border-gray-50 rounded-[2rem] flex flex-col justify-between p-4 text-left bg-white active:scale-95 transition shadow-sm hover:shadow-md"
            >
              <span className="font-black text-base leading-tight text-gray-800">
                {lang === "en" ? item.nameEn || item.name : item.name}
              </span>
              <span className="text-blue-600 font-black text-xl w-full text-right tracking-tighter">
                ･{item.price.toLocaleString()}
              </span>
            </button>
          ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-4 border-gray-50 p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.1)] z-50 rounded-t-[2.5rem]">
        {cart.length > 0 && (
          <div className="mb-4 max-h-32 overflow-y-auto space-y-2 border-b border-dashed border-gray-100 pb-3 scrollbar-hide">
            {cart.map((i) => (
              <div
                key={i.cartId}
                className="flex justify-between items-center font-black text-gray-500 px-2 animate-in slide-in-from-bottom-1"
              >
                <span className="text-sm truncate w-1/2">
                  {lang === "en" ? i.nameEn || i.name : i.name}
                </span>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => removeFromCart(i.cartId)}
                    className="text-red-500 bg-red-50 p-1.5 rounded-lg active:scale-125 transition-transform"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="text-gray-800 w-5 text-center text-lg">
                    {i.quantity}
                  </span>
                  <button
                    onClick={() => addToCart(i, i.optionLabel)}
                    className="text-blue-500 bg-blue-50 p-1.5 rounded-lg active:scale-125 transition-transform"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <button
          onClick={() => {
            onOrderSubmit({
              tableNumber,
              items: cart,
              status: "pending",
              isPaid: false,
              createdAt: Date.now(),
              totalAmount: total,
            });
            alert(t.sent);
            setCart([]);
          }}
          disabled={!cart.length}
          className={`w-full py-5 rounded-3xl font-black text-2xl shadow-2xl flex justify-between px-8 transition active:scale-[0.98] ${
            cart.length > 0
              ? "bg-green-600 text-white shadow-green-100"
              : "bg-gray-100 text-gray-300 shadow-none"
          }`}
        >
          <span>{t.confirmOrder}</span>
          <span className="tracking-tighter">･{total.toLocaleString()}</span>
        </button>
      </div>
    </div>
  );
};

// --- メインアプリ ---
export default function App() {
  const [view, setView] = useState("connect");
  const [role, setRole] = useState(null); // 'host', 'client', 'guest'
  const [peer, setPeer] = useState(null);
  const [conn, setConn] = useState(null);
  const [myId, setMyId] = useState("");
  const [lang, setLang] = useState("ja");
  const [showManageMenu, setShowManageMenu] = useState(false);
  const [showInvite, setShowInvite] = useState(false);

  // v8: 管理機能追加・初期データ維持版
  const [menuData, setMenuData] = useState(() => {
    const s = localStorage.getItem("pos_menu_v8");
    return s ? JSON.parse(s) : INITIAL_MENU_DATA;
  });
  const [orders, setOrders] = useState(() => {
    const s = localStorage.getItem("pos_orders_v8");
    return s ? JSON.parse(s) : [];
  });
  const [currentTable, setCurrentTable] = useState(null);

  const connectionsRef = useRef([]);

  useEffect(() => {
    localStorage.setItem("pos_orders_v8", JSON.stringify(orders));
  }, [orders]);
  useEffect(() => {
    localStorage.setItem("pos_menu_v8", JSON.stringify(menuData));
  }, [menuData]);

  // PeerJS通信
  useEffect(() => {
    if (role !== "host" || !peer) return;
    const handleConn = (c) => {
      connectionsRef.current.push(c);
      c.on("open", () => {
        c.send({ type: "SYNC_MENU", payload: menuData });
        c.send({ type: "SYNC_ORDERS", payload: orders });
        c.send({ type: "SYNC_LANG", payload: lang });
      });
      c.on("data", (data) => {
        if (data.type === "NEW_ORDER")
          setOrders((prev) => [
            ...prev,
            { ...data.payload, id: `ORD-${Date.now()}` },
          ]);
        if (data.type === "CHECKOUT")
          setOrders((prev) =>
            prev.map((o) =>
              String(o.tableNumber) === String(data.payload)
                ? { ...o, isPaid: true }
                : o
            )
          );
      });
    };
    peer.on("connection", handleConn);
    return () => peer.off("connection", handleConn);
  }, [role, peer, orders, menuData, lang]);

  const handleStartHost = () => {
    const p = new Peer();
    p.on("open", (id) => {
      setMyId(id);
      setPeer(p);
      setRole("host");
      setView("tables");
      setShowInvite(true);
    });
    p.on("error", () => alert("接続エラー。再読み込みしてください。"));
  };

  const handleOrderSubmit = (data) => {
    if ((role === "client" || role === "guest") && conn)
      conn.send({ type: "NEW_ORDER", payload: data });
    else setOrders((prev) => [...prev, { ...data, id: `ORD-${Date.now()}` }]);

    if (role !== "guest") {
      setCurrentTable(null);
    }
  };

  // メニュー保存
  const handleSaveMenuItem = (item) => {
    setMenuData((prev) => {
      const exists = prev.some((m) => m.id === item.id);
      const next = exists
        ? prev.map((m) => (m.id === item.id ? item : m))
        : [...prev, item];

      if (role === "host")
        connectionsRef.current.forEach((c) => {
          if (c.open) c.send({ type: "SYNC_MENU", payload: next });
        });
      return next;
    });
  };

  // メニュー削除
  const handleDeleteMenuItem = (id) => {
    setMenuData((prev) => {
      const next = prev.filter((m) => m.id !== id);
      if (role === "host")
        connectionsRef.current.forEach((c) => {
          if (c.open) c.send({ type: "SYNC_MENU", payload: next });
        });
      return next;
    });
  };

  const toggleLang = () => {
    const nextLang = lang === "ja" ? "en" : "ja";
    setLang(nextLang);
    if (role === "host")
      connectionsRef.current.forEach((c) => {
        if (c.open) c.send({ type: "SYNC_LANG", payload: nextLang });
      });
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const joinId = params.get("join");
    const tableParam = params.get("table");

    if (joinId && view === "connect") {
      const p = new Peer();
      p.on("open", () => {
        const c = p.connect(joinId);
        setConn(c);

        if (tableParam) {
          setRole("guest");
          setCurrentTable(tableParam);
          setView("order");
        } else {
          setRole("client");
          setView("tables");
        }

        c.on("data", (d) => {
          if (d.type === "SYNC_MENU") setMenuData(d.payload);
          if (d.type === "SYNC_ORDERS" && !tableParam) setOrders(d.payload);
          if (d.type === "SYNC_LANG") setLang(d.payload);
        });
      });
    }
  }, [view]);

  if (view === "connect")
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-100 p-8 space-y-8 select-none">
        <div className="text-center animate-in fade-in slide-in-from-top duration-700">
          <h1 className="text-6xl font-black text-gray-800 tracking-tighter mb-2">
            POS <span className="text-blue-600 uppercase">Link</span>
          </h1>
          <p className="text-gray-400 font-black uppercase tracking-[0.3em] text-xs">
            Menu Management Edition
          </p>
        </div>
        <div className="w-full max-w-xs space-y-4">
          <button
            onClick={handleStartHost}
            className="w-full bg-blue-600 text-white py-6 rounded-[2.5rem] font-black text-2xl shadow-2xl shadow-blue-200 active:scale-95 transition flex items-center justify-center"
          >
            <Monitor className="mr-3" size={32} /> 親機{" "}
            <span className="text-sm ml-2 opacity-60">(厨房)</span>
          </button>
          <button
            onClick={() => {
              const id = prompt("親機のIDを入力");
              if (id) {
                const p = new Peer();
                p.on("open", () => {
                  const c = p.connect(id);
                  setConn(c);
                  setRole("client");
                  setView("tables");
                  c.on("data", (d) => {
                    if (d.type === "SYNC_MENU") setMenuData(d.payload);
                    if (d.type === "SYNC_ORDERS") setOrders(d.payload);
                    if (d.type === "SYNC_LANG") setLang(d.payload);
                  });
                });
              }
            }}
            className="w-full bg-orange-600 text-white py-6 rounded-[2.5rem] font-black text-2xl shadow-2xl shadow-orange-200 active:scale-95 transition flex items-center justify-center"
          >
            <Smartphone className="mr-3" size={32} /> 子機{" "}
            <span className="text-sm ml-2 opacity-60">(入力)</span>
          </button>
        </div>
      </div>
    );

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-white font-sans select-none">
      {showManageMenu && (
        <ManageMenuModal
          lang={lang}
          onClose={() => setShowManageMenu(false)}
          menuData={menuData}
          onSave={handleSaveMenuItem}
          onDelete={handleDeleteMenuItem}
        />
      )}
      {showInvite && role === "host" && (
        <InviteModal
          hostId={myId}
          lang={lang}
          onClose={() => setShowInvite(false)}
        />
      )}

      {role !== "guest" && (
        <div className="bg-gray-800 text-white p-3 flex justify-between items-center text-xs sticky top-0 z-50">
          <div className="flex items-center space-x-2">
            <span
              className={`px-3 py-1 rounded-full font-black uppercase tracking-tighter ${
                role === "host" ? "bg-blue-600" : "bg-orange-600"
              }`}
            >
              {role === "host" ? "Master" : "Terminal"}
            </span>
            {role === "host" && (
              <button
                onClick={() => setShowInvite(true)}
                className="flex items-center font-mono bg-gray-700 px-2 py-1 rounded text-[10px] font-bold text-blue-300 active:bg-blue-900 transition"
              >
                ID: {myId} <Share2 size={10} className="ml-1" />
              </button>
            )}
          </div>
          <div className="flex space-x-2 items-center">
            <button
              onClick={toggleLang}
              className="p-2 rounded-xl bg-gray-700 text-blue-400 font-black active:scale-90 transition px-3 tracking-widest"
            >
              {lang.toUpperCase()}
            </button>
            <button
              onClick={() => setView("kitchen")}
              className={`p-2 rounded-xl transition ${
                view === "kitchen" ? "bg-orange-600" : "bg-gray-700"
              }`}
            >
              <Utensils size={18} />
            </button>
            <button
              onClick={() => {
                setView("tables");
                setCurrentTable(null);
              }}
              className={`p-2 rounded-xl transition ${
                view === "tables" && !currentTable
                  ? "bg-blue-600"
                  : "bg-gray-700"
              }`}
            >
              <Monitor size={18} />
            </button>
            {role === "host" && (
              <button
                onClick={() => setShowManageMenu(true)}
                className="p-2 bg-green-600 rounded-xl hover:bg-green-500 transition active:scale-90 shadow-lg shadow-green-900/40"
              >
                <Settings size={18} />
              </button>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-hidden relative">
        {view === "kitchen" ? (
          <KitchenView
            lang={lang}
            orders={orders}
            onUpdateOrder={(id, u) =>
              setOrders((prev) =>
                prev.map((o) => (o.id === id ? { ...o, ...u } : o))
              )
            }
          />
        ) : !currentTable ? (
          <TableSelectionView
            lang={lang}
            onSelectTable={setCurrentTable}
            orders={orders}
            onCheckoutTable={(num) =>
              setOrders((prev) =>
                prev.map((o) =>
                  String(o.tableNumber) === String(num)
                    ? { ...o, isPaid: true }
                    : o
                )
              )
            }
          />
        ) : (
          <OrderView
            lang={lang}
            menuData={menuData}
            tableNumber={currentTable}
            onBackToTables={() => setCurrentTable(null)}
            onOrderSubmit={handleOrderSubmit}
            isGuest={role === "guest"}
          />
        )}
      </div>
    </div>
  );
}
