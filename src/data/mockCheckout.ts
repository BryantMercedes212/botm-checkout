import type { Book, ShippingAddress } from '../types';

// Hardcoded for now. In the real app these would come from the cart and
// account APIs. Books are real September 2026 BOTM picks. Price is the
// standard $17.99 (add-on pricing depends on member status, so the server
// would send the real number).

export const mockBooks: Book[] = [
  {
    id: 'bk_if_not_you',
    title: 'If Not You',
    author: "Ellen O'Clover",
    coverUrl: 'https://static.bookofthemonth.com/covers/list/IfNotYou_291J439v.jpg',
    priceCents: 1799,
  },
  {
    id: 'bk_first_lady_freeman',
    title: 'The True Confessions of First Lady Freeman',
    author: 'Deesha Philyaw',
    coverUrl:
      'https://static.bookofthemonth.com/covers/list/TheTrueConfessionsOfFirstLadyFreeman_hj1E0Zfz.jpg',
    priceCents: 1799,
  },
  {
    id: 'bk_wretched_divine',
    title: 'The Wretched Divine',
    author: 'Adalyn Grace',
    coverUrl: 'https://static.bookofthemonth.com/covers/list/TheWretchedDivine_yi5DNRGb.jpg',
    priceCents: 1799,
  },
];

export const mockAddress: ShippingAddress = {
  name: 'Jordan Ellis',
  line1: '221 Maple Avenue',
  line2: 'Apt 4B',
  city: 'Brooklyn',
  state: 'NY',
  postalCode: '11215',
};
