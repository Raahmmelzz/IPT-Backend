// types.ts
export interface Customer {
    customerid?: number;
    name: string;
    username: string;
    email: string;
    number: string;
    password?: string;
}

export interface Product {
    productid?: number;
    productname: string;
    price: string | number;
    image?: string;
}

// --- NEW INVOICE TYPES ---
export interface InvoiceItem {
    product: number; // The product ID
    quantity: number;
    price_at_purchase?: string | number; // Returned by backend
}

export interface Invoice {
    invoiceid?: number;
    customer: number; // The customer ID
    date?: string;
    is_paid: boolean;
    payment_method: string;
    subtotal?: string | number; // Calculated by backend
    tax?: string | number;      // Calculated by backend
    total?: string | number;    // Calculated by backend
    items: InvoiceItem[];
    amount_paid?: number | string; 
    change?: number | string;       // Array of items in this invoice
}