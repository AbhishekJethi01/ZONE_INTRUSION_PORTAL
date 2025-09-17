export class RequestParam {
  start?: number;
  length?: number;
  sortBy?: string;
  sortOrder?: string;
  columnSearch?: string;
  id?:number;
  isDeleted?:boolean
  dynamicParams?: { [key: string]: any } = {};
  //[key: string]: any;
}