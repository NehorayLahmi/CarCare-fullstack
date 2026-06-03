export const SERVICE_TYPES = [
  'החלפת שמן',
  'החלפת רפידות בלם',
  'החלפת צמיגים',
  'בדיקת בלמים',
  'טיפול תקופתי',
  'בדיקת מערכת חשמל',
  'החלפת פילטר',
  'טיפול אחר',
];

export const PERIODIC_SERVICE_TYPES = ['טיפול תקופתי'];

export const INITIAL_FORM = {
  type: SERVICE_TYPES[0],
  customType: '',
  date: '',
  cost: 0,
  note: '',
  garageName: '',
  kilometer: '',
  _id: null,
};
