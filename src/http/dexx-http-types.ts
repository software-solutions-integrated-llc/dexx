export interface DexxHttpResponse {
  url: string;
  body: any;
  status: number;
  headers: { [name: string]: string };
}

export interface DexxHttpHeaders { [name: string]: string };
