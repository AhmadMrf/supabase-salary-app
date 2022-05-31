//  import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'
//  import PanelAccount from './modules.js'
//  import AddPatient from './modules.js'
// import { LoginSection, PanelAccount, AddPatient } from './modules.js'

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
const supabaseUrl = "https://evcestdvcdqmklxwirmp.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2Y2VzdGR2Y2RxbWtseHdpcm1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NTMzMDk2ODUsImV4cCI6MTk2ODg4NTY4NX0.TsUgJIRuIavxbvz0Ez-sdJ9uuaQHcIGuWrD5lUjHnrw";
const database = createClient(supabaseUrl, supabaseKey);

// import database from './modules.js'

// window.customElements.define('login-section', LoginSection)
// window.customElements.define('panel-account', PanelAccount)
// window.customElements.define('add-patient', AddPatient)

// const supabaseUrl = 'https://evcestdvcdqmklxwirmp.supabase.co'
// const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2Y2VzdGR2Y2RxbWtseHdpcm1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NTMzMDk2ODUsImV4cCI6MTk2ODg4NTY4NX0.TsUgJIRuIavxbvz0Ez-sdJ9uuaQHcIGuWrD5lUjHnrw'
// const database = createClient(supabaseUrl, supabaseKey)

const loginLabel = document.querySelector("#login-label");
const loginContent = document.querySelector("#login-content");
const addPatient = document.querySelector("#add-patient-form");
const tbody = document.querySelector("table > tbody");

let loginForm;
let login_logout_btn;
let emailValue;
let passwordValue;
let fullNameValue;
let jobValue;
let loginBtn;
// let isLogin = true;
// let isLogin = await database.auth.user(); // data or null
// let activeSession = await database.auth.session()  //data or null
// let { data: patientData, error } = await database.from('patients')  //data or error


// console.log('islogin',isLogin());
setUpApp(isLogin());
// loginForm = loginContent.querySelector('form')
console.log(login_logout_btn);


function isLogin() {
  console.log('is login');
  let localUser = JSON.parse(localStorage.getItem('supabase.auth.token'))
  if (localUser) {
    let { currentSession: { user } } = localUser
    return user
  } else {
    return localUser
  }
}

// if sign in retun user info
// if error return  error obj (error: Object { message: "Invalid login credentials", status: 400 })
async function signInAccount() {
  console.log('signin');
  emailValue = loginForm.elements.email;
  passwordValue = loginForm.elements.password;

  const { user, error } = await database.auth.signIn({
    email: emailValue.value,
    password: passwordValue.value,
  });
  // console.log(typeof error);
  if (error) {
    errorManage(error);
  }
  return user;
}

// signInAccount()

//if signup return user info
//if error return error  (error: Object { message: "User already registered", status: 400 })
async function signUpAccount() {
  console.log('signup');
  emailValue = loginForm.elements.email;
  passwordValue = loginForm.elements.password;
  fullNameValue = loginForm.elements.fullName;
  jobValue = loginForm.elements.job;

  const { user, session, error } = await database.auth.signUp(
  {
    email: "me1@email.com",
    password: "123456",
  },
  {
    data: {
      fullName: "علی باقری",
      job: "پرستار",
    },
  });
}

async function signOutAccount() {
  console.log('signout');
  let activeSession = await database.auth.session();
  return await database.auth.signOut(activeSession.access_token);
}

async function setUpApp(loginStat, patients = []) {
  console.log("setup");

  // let {data:patientsData, error} = loginStat ? await database.from('patients') : [] ;
  // let patientsData = loginStat ? await getPatientsData(loginStat.id) : [] ;
  console.log(patients);

  loginLabel.textContent = loginStat ?
    `درمانگر : ${loginStat.user_metadata.fullName}` :
    "ورود - ثبت نام";

  loginContent.innerHTML = loginStat ?
    `
      <div class="panel-account">
        <div class="panel-info">
          <span>${loginStat.user_metadata.fullName}</span>
          <span>${loginStat.user_metadata.job}</span>
          <span>تعداد بیماران : <span id="patient-number" >${patients.length}</span></span>
        </div>
        <button type="button" href="#">خروج</button>
      </div>
  ` :
    `
      <form action="#">
        <div class="info">
          <input type="email" name="email" placeholder="ایمیل" />
          <input type="password" name="password" placeholder="رمز ورود" />
          <input class="nurse-data" type="text" name="fullName" placeholder="نام و نام خانوادگی" />
          <input class="nurse-data" type="text" name="job" placeholder="سمت و شغل" />
        </div>
        <button type="button" href="#">ورود یا ثبت نام</button>
        <a href="#">فراموشی رمز عبور </a>
      </form>
  `;

  loginForm = loginContent.querySelector("form");
  login_logout_btn = loginContent.querySelector("button");

  addPatient.innerHTML = loginStat ?
    `
      <form action="#">
        <div class="info">
          <input class="fname" type="text" name="name" placeholder="نام بیمار"/>
          <input type="text" name="name" placeholder="کد ملی" />
          <input type="text" name="name" placeholder="شماره تماس" />
          <input type="text" name="name" placeholder="آدرس" />
        </div>
        <button href="#">افزودن بیمار جدید</button>
      </form>
  ` :
    "<span>ابتدا وارد حساب کاربری خود شوید</span>";

  tbody.innerHTML = loginStat ?
    `
      <tr>
        <td class="column1">1</td>
        <td class="column2">احمد معروفی</td>
        <td class="column3">0936565656</td>
        <td class="column4">500</td>
        <td class="column5">400</td>
        <td class="column6"><button>edit</button></td>
      </tr>
` :
    '<tr><td class="fake-td" colspan="6">برای مشاهده اطلاعات وارد حساب کاربری خود شوید</td></tr>';
}

function errorManage(errorMassage) {
  console.log('error manage');
  console.log(errorMassage, "مدیریت خطا");
}


async function getPatientsData(id) {
  console.log("get");
  let { data, error } = await database.from('patients')
  return data ? data : error;

}


// console.log(login_logout_btn);
login_logout_btn.addEventListener('click', () => {
  if (isLogin()) {
    // sign out btn active
    let { error } = await signOutAccount();
    if (error) {
      console.log("has error", error);
    } else {
      console.log("no error", error);
      setUpApp(error);
    }
  } else {
    console.log('click');
    //sign in btn active 
    let userData = await signInAccount();
    if (userData) {
      setUpApp(userData);
    } else {
      console.log(userData, " خطا");
    }
  }
});

// signOutBtn?signOutBtn.addEventListener('click', async ()=>{
// await database.auth.signOut(activeSession.access_token)
//   setUpApp(await database.auth.user())
//   console.log('loge out succesfully')
// }) : console.log('no'); ;

// async function logOut(){
// }

//  await database.auth.signOut()
// const session = await database.auth.session()
// let c = await database.auth.signOut(session.access_token)
// console.log('0',signOutBtn);
// console.log(session);
// console.log(c);

// let g = await database.from('4patients')
// console.log(g);
// let tr
// let trs = data.map( (el, i) => {
//   return tr = `<tr>
//   <td class="column1">${+i+1}</td>
//   <td class="column2">${el.fullName}</td>
//   <td class="column3">${el.telNum}</td>
//   <td class="column4">${el.visit+el.equip}</td>
//   <td class="column5">${el.income}</td>
//   <td class="column6"><button>edit</button></td>
//   </tr>`
// });
// table.innerHTML = ""
// table.insertAdjacentHTML('beforeend', trs.join(""))
// let pn= document.querySelector('panel-account').shadowRoot.querySelector('#patient-number').innerHTML = data.length

// const b = await database.auth.signIn(
//   {
//     email: 'me1@email.com',
//     password: '0123456',
//   }
// )
// console.log(b);
// let a = await database.auth.user()
// console.log(a.user_metadata.job);

// const c = await database.auth.update({
//   email: "me1@email.com",
//   password: "0123456",
//   data: { fullName:'علی باقری',job:' کارشناس زخم' }
// })

// let c = await database.auth.signOut()

// console.log(isLogin);