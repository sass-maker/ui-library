const APP_HEALTH_CONFIG = Object.freeze({
  anchor: Object.freeze({
    projectId: "app-4784890d-36ad-4350-9894-98e9cc30c31e",
    publicKey: "ahk_pub_7c48fabf379142912a42cb6774a2c7bc555d890f5809b59f5db5bde02c4b6554",
  }),
  calorie: Object.freeze({
    projectId: "app-a2a82816-4bb4-4bea-b5e7-7e982172e79c",
    publicKey: "ahk_pub_36a9474d23773b3586e5488918b62d5acbd78150d7ce1f5971bfa560e4df404a",
  }),
  kith: Object.freeze({
    projectId: "app-de5dafb3-3d95-4128-9237-995811f3562a",
    publicKey: "ahk_pub_5500981d8665601e6971008e5d598002950cb89d35b0b19076fa15b22384dd41",
  }),
  setline: Object.freeze({
    projectId: "app-59c90aa8-3749-483d-b813-ba49ea699f18",
    publicKey: "ahk_pub_35d2981dfd952d8c2649871054c150d96208fb70493217b2126461fe177e61b9",
  }),
  browserdaddy: Object.freeze({
    projectId: "app-import-8aef29b798cf1e1685b401324903b7ac54768a4eee220ee4d10a5a2fe4ff52b5",
    publicKey: "ahk_pub_d05c2f5acde4c6055857b517ffcb8a0d5a7e50aebebec85eebe6ff2045beac0f",
  }),
  contextdaddy: Object.freeze({
    projectId: "app-import-2b4e7910da0dbabd63ec5e732ba5ec8c31e6d561ea94c8add7a13d041f62bb7d",
    publicKey: "ahk_pub_e6a45ae53b2f34b5ddb929160487b00dff788d022b9d118be4c45b6223e3ff25",
  }),
  performancedaddy: Object.freeze({
    projectId: "app-import-74da467c34f82d570ec0ac77254d171ac255942e060232e0fde27d22b1fb47f1",
    publicKey: "ahk_pub_06237a91cc8013927192836ea4397e6e0753bcd85278789e20ed46033c8256c8",
  }),
  motion: Object.freeze({
    projectId: "app-import-60cb3bd9053732d2e6f2d4c47381a65bc2378249b995225f739b16e1075646fd",
    publicKey: "ahk_pub_8e1a0c74f74de2ce27e6bc7fd33cf9bde268c5770dc298aa08d14084f78c38d1",
  }),
});

export function appHealthConfigFor(productId) {
  return APP_HEALTH_CONFIG[productId] ?? null;
}
