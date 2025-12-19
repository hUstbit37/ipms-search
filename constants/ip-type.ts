export const IP_TYPES = {
  TRADEMARK: 'trademark',         // Nhãn hiệu
  PATENT: 'patent',               // Sáng chế
  COPYRIGHT: 'copyright',         // Bản quyền
  INDUSTRIAL_DESIGN: 'industrial_design', // Kiểu dáng công nghiệp
  GEOGRAPHICAL_INDICATION: 'geographical_indication' // Chỉ dẫn địa lý
} as const;

export type IpType = (typeof IP_TYPES)[keyof typeof IP_TYPES]; 

export const IP_TYPE_LABELS: Record<IpType, string> = {
  [IP_TYPES.TRADEMARK]: 'Nhãn hiệu',
  [IP_TYPES.PATENT]: 'Sáng chế',
  [IP_TYPES.COPYRIGHT]: 'Quyền tác giả',
  [IP_TYPES.INDUSTRIAL_DESIGN]: 'Kiểu dáng công nghiệp',
  [IP_TYPES.GEOGRAPHICAL_INDICATION]: 'Chỉ dẫn địa lý',

};

export const IP_TYPE_COLORS: Record<IpType, string> = {
  [IP_TYPES.TRADEMARK]: 'blue',
  [IP_TYPES.PATENT]: 'green',
  [IP_TYPES.COPYRIGHT]: 'orange',
  [IP_TYPES.INDUSTRIAL_DESIGN]: 'purple',
  [IP_TYPES.GEOGRAPHICAL_INDICATION]: 'red',
};