export const ordersBuyerInfoData = [
  {
    profile: "/no-profile.svg",
    username: "Ahoora niazi jafar zade sofla",
    account: "@ahoora.niazi_sofla.originality",
    orderId: "OR0000001",
    destination: "سیستان بلوچستان",
    totalPrice: "800.000.000",
    note: "این پیام از طرف خریدار نوشته شده است و شما به عنوان فروشنده موظف به عمل به آن هستید",
    orderDate: "12/4/1403 - 12:58pm",
    payment: "SDFG546DFG85",
    deliveryType: "پست",
    mobile: "0913-866-4066",
    zip: "8175764911",
    deliverTo: "ahoora niazi jafar zade sofla",
    address: "86 Lakeland Park Drive, Marietta, Georgia",
  },
] as const;

export const ordersProductInfoData = [
  {
    image: "/post.png",
    productname: "کفش فوتسال پوما فیوچر با تنوع رنگ و زیره ری اکت و رویه مقاوم",
    productid: "# 213",
    productprice: "500.000 $",
    quantity: 3,
    tags: [
      { label: "رنگ", value: "red" },
      { label: "سایز", value: "32" },
      { label: "رویه", value: "wood" },
    ],
  },
] as const;

export const orderDetailConfig = {
  orderId: "OR0000001",
} as const;
