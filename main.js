//  import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'
//  import PanelAccount from './modules.js'
//  import AddPatient from './modules.js'
// import { LoginSection, PanelAccount, AddPatient } from './modules.js'

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'
const supabaseUrl = 'https://evcestdvcdqmklxwirmp.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2Y2VzdGR2Y2RxbWtseHdpcm1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NTMzMDk2ODUsImV4cCI6MTk2ODg4NTY4NX0.TsUgJIRuIavxbvz0Ez-sdJ9uuaQHcIGuWrD5lUjHnrw'
const database = createClient(supabaseUrl, supabaseKey)



// import database from './modules.js'


// window.customElements.define('login-section', LoginSection)
// window.customElements.define('panel-account', PanelAccount)
// window.customElements.define('add-patient', AddPatient)

// const supabaseUrl = 'https://evcestdvcdqmklxwirmp.supabase.co'
// const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2Y2VzdGR2Y2RxbWtseHdpcm1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NTMzMDk2ODUsImV4cCI6MTk2ODg4NTY4NX0.TsUgJIRuIavxbvz0Ez-sdJ9uuaQHcIGuWrD5lUjHnrw'
// const database = createClient(supabaseUrl, supabaseKey)


const loginLabel = document.querySelector('#login-label');
const loginContent = document.querySelector('#login-content');
const addPatient = document.querySelector('#add-patient-form');
const tbody = document.querySelector('table > tbody')

let loginForm 
let emailValue
let passwordValue
let fullNameValue
let jobValue
let loginBtn 

let isLogin = await database.auth.user()   // data or null
let activeSession = await database.auth.session()  //data or null
// let { data: patientData, error } = await database.from('patients')  //data or error

setUpApp(false)

// loginForm = loginContent.querySelector('form')
console.log(loginForm.elements);




// if sign in retun user info
// if error return  error obj (error: Object { message: "Invalid login credentials", status: 400 }) 
async function signInAccount(){

emailValue = loginForm.elements.email
passwordValue = loginForm.elements.password

  const {user , error} = await database.auth.signIn(
    {
      email: emailValue.value,
      password: passwordValue.value,
    }
    )
    if(error){
      errorManage(error)
    }
    return user
  }
  
  // signInAccount()



  //if signup return user info
  //if error return error  (error: Object { message: "User already registered", status: 400 })
async function signUpAccount(){

emailValue = loginForm.elements.email
passwordValue = loginForm.elements.password
fullNameValue = loginForm.elements.fullName
jobValue = loginForm.elements.job

  const { user, session, error } = await database.auth.signUp(
      {
        email: 'me1@email.com',
        password: '123456',
      },{
        data:{
          fullName:'علی باقری',
          job:'پرستار'
        }
      }
    )
}


async function signOutAccount(){
//  await database.auth.signOut()
}


function setUpApp(loginStat) {
  loginLabel.textContent = loginStat ? `درمانگر : ${'علی باقری'}` : 'ورود - ثبت نام';

  loginContent.innerHTML = loginStat ?
  `
      <div class="panel-account">
        <div class="panel-info">
          <span>علی باقری</span>
          <span>پرستار</span>
          <span>تعداد بیماران : <span id="patient-number" >3</span></span>
        </div>
        <button type="button" href="#">خروج</button>
      </div>
  ` : `
      <form action="#">
        <div class="info">
          <input type="email" name="email" placeholder="ایمیل" />
          <input type="password" name="password" placeholder="رمز ورود" />
          <input class="nurse-data" type="text" name="fullName" placeholder="نام و نام خانوادگی" />
          <input class="nurse-data" type="text" name="job" placeholder="سمت و شغل" />
        </div>
        <button type="button" name="submit" href="#">ورود یا ثبت نام</button>
        <a href="#">فراموشی رمز عبور </a>
      </form>
  ` ;

  loginForm = loginContent.querySelector('form')

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
  '<span>ابتدا وارد حساب کاربری خود شوید</span>' ;

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
`
  :
'<tr><td class="fake-td" colspan="6">برای مشاهده اطلاعات وارد حساب کاربری خود شوید</td></tr>'
  ;


}

function errorManage(){
  console.log(error, 'مدیریت خطا');
}

loginForm.elements.submit.addEventListener('click', ()=> {
let userResponse = signInAccount()

userResponse.then(user=>{
  if(user){
    // setUpApp(user)
  }else{
    console.log(user, ' خطا');
  }
  })
})

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






//   let {data} = await database.from('patients')
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
