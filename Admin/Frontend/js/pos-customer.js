/* Match an exact customer code or phone, never a partial/name match. */
function findPosCustomers(customers, query) {
 const value=String(query??'').trim();if(!value)return [];
 const code=value.toUpperCase();
 const byCode=customers.filter(c=>String(c.MaKH??'').trim().toUpperCase()===code);
 if(byCode.length)return byCode;
 if(!/^[+\d\s().-]+$/.test(value))return [];
 const phone=text=>String(text??'').replace(/\D/g,'').replace(/^84(?=\d{9}$)/,'0');
 const number=phone(value);if(number.length<9)return [];
 return customers.filter(c=>phone(c.SoDTKH)===number);
}
