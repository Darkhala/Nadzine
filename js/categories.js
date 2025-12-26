/*
  Nadzine Emporium Categories
  Main categories are fixed to the client's request and used by:
  - Home (left categories and section grouping)
  - Shop filters (Main Category dropdown)
  - Admin pages (manage/upload selectors)
*/

// Ordered list of main categories
window.MAIN_CATEGORIES = [
  'male fragrance',
  'female fragrance',
  'female accessories',
  'male accessories',
  'Clothes',
  'Electronics',
];

// Optional: provide subcategories per main category.
// Keep minimal/empty unless specified.
window.getSubcategories = function(main){
  switch ((main||'').toLowerCase()){
    case 'male fragrance':
      return [ 'Eau de Parfum', 'Eau de Toilette', 'Oud', 'Deodorant' ];
    case 'female fragrance':
      return [ 'Eau de Parfum', 'Eau de Toilette', 'Mist', 'Gift Sets' ];
    case 'female accessories':
      return [ 'Bags', 'Jewelry', 'Scarves', 'Belts' ];
    case 'male accessories':
      return [ 'Watches', 'Belts', 'Wallets', 'Caps' ];
    case 'Clothes':
      return [ 'Women', 'Men', 'Kids' ];
    case 'Electronics':
      return [ 'Phones', 'Audio', 'Wearables', 'Gadgets' ];
    default:
      return [];
  }
};
