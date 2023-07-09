export const getPath = {
  index: () => '/',
  create: () => '/create/',
  account: (id: string) => `/account/${id}/`,
  mint: (id: string) => `/mint/${id}`,
  addItem: (id: string) => `/add_item/${id}`,
  compressedItem: (id: string) => `/compressed_item/${id}`,
  umiTest: () => '/umi_test/',
};
