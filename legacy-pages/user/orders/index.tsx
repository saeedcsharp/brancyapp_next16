import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";

// Add product data structure
const stores = [
  {
    id: 1,
    storePicture: "/no-profile.svg",
    storeName: "store akbar",
    storeId: "@akbarstore",
    products: [
      {
        id: 1,
        name: " کفش آبی رنک نایکی فش آبی رنک نایکیکفش آبی رنک نایکی",
        image: "/post.png",
        variations: [
          { name: "size", value: "small" },
          { name: "color", value: "red" },
          { name: "cable", value: "rokeshe kanafi" },
          { name: "variation", value: "ye chize klhali" },
        ],
        price: "123456",
        Discount: "1000",
        quantity: 1,
        quantitylimit: 3,
      },
      {
        id: 2,

        name: "product name",
        image: "/post.png",
        variations: [
          { name: "size", value: "small" },
          { name: "color", value: "blue" },
          { name: "model", value: "ye cgizedfg" },
          { name: "dfgyj", value: "fghjnhj,tyjrt" },
        ],
        price: "10500001",
        Discount: "500",
        quantity: 1,
        quantitylimit: 5,
      },
    ],
  },
  {
    id: 2,
    storePicture: "/no-profile.svg",
    storeName: "store asghar",
    storeId: "@asgharstore",
    products: [
      {
        id: 1,
        name: "product name",
        image: "/post.png",
        variations: [
          { name: "size", value: "small" },
          { name: "color", value: "red" },
          { name: "cable", value: "rokeshe kanafi" },
          { name: "variation", value: "ye chize klhali" },
        ],
        price: "100000000",
        Discount: "4000",
        quantity: 1,
        quantitylimit: 10,
      },
    ],
  },

  // Add more stores as needed
];

const Orders = () => {
  //  return <Soon />;
  const router = useRouter();
  const { data: session } = useSession({
    required: true,
    onUnauthenticated: () => router.push("/"),
  });
  let route = router.route;
  useEffect(() => {
    if (route === "/user/orders") router.push("/user/orders/cart");
  }, []);
};

export default Orders;
