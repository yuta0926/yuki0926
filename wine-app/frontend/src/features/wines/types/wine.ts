export type Wine = {
    id: number;
  
    original_no: number | null;
    order_date: string | null;
  
    wine_type: string | null;
    style_type: string | null;
  
    name: string;
    name_kana: string | null;
  
    country: string | null;
    producer: string | null;
    grape_variety: string | null;
  
    vintage: number | null;
    size: string | null;
  
    retail_price: number | null;
    purchase_price: number | null;
    quantity: number;
    sale_price: number | null;
  
    location: string | null;
    management_code: string | null;
    reserved_quantity: number;
    available_quantity: number;
    image_url: string | null;
    comment: string | null;

    ai_check_status: string | null;

    recent_transactions: InventoryTransaction[];

    created_at: string;
    updated_at: string;
  };


  export type TransactionType = "in" | "out" | "move" | "adjust";


  export type InventoryTransaction = {
    id: number;
    transaction_type: TransactionType;
    quantity: number;
    from_location: string | null;
    to_location: string | null;
    note: string | null;
    operated_by: string | null;
    transaction_at: string;
  };


  export type InventoryTransactionCreateInput = {
    transaction_type: TransactionType;
    quantity: number;
    from_location?: string | null;
    to_location?: string | null;
    note?: string | null;
    operated_by?: string | null;
  };


  export type WineListResponse = {
    total: number;
    skip: number;
    limit: number;
    items: Wine[];
  };
  
  
  export type WineSortField =
    | "id"
    | "name"
    | "vintage"
    | "sale_price"
    | "quantity"
    | "created_at";
  
  
  export type SortOrder =
    | "asc"
    | "desc";
  
  
  export type WineSearchParams = {
    keyword?: string;
    wine_type?: string;
    style_type?: string;
    country?: string;
    producer?: string;
    grape_variety?: string;
  
    vintage?: number;
    location?: string;
  
    min_sale_price?: number;
    max_sale_price?: number;
  
    in_stock?: boolean;
  
    sort_by?: WineSortField;
    sort_order?: SortOrder;
  
    skip?: number;
    limit?: number;
  };
  
  
  export type WineCreateInput = {
    original_no?: number | null;
    order_date?: string | null;
  
    wine_type?: string | null;
    style_type?: string | null;
  
    name: string;
    name_kana?: string | null;
  
    country?: string | null;
    producer?: string | null;
    grape_variety?: string | null;
  
    vintage?: number | null;
    size?: string | null;
  
    retail_price?: number | null;
    purchase_price?: number | null;
    quantity?: number;
    sale_price?: number | null;
  
    location?: string | null;
    management_code?: string | null;
    reserved_quantity?: number;
    image_url?: string | null;
    comment?: string | null;

    ai_check_status?: string | null;
  };
  
  
  export type WineUpdateInput =
    Partial<WineCreateInput>;