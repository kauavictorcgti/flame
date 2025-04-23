import { Model } from '.';

export interface NewBookmark {
  name: string;
  url: string;
  description: string;
  categoryId: number;
  icon: string;
  isPublic: boolean;
}

export interface Bookmark extends Model, NewBookmark {
  orderId: number;
}
