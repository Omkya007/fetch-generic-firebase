const cl = console.log;

const loader = document.getElementById("loader");
const postForm = document.getElementById("postform");
const titleCon = document.getElementById("title");
const contentCon = document.getElementById("content");
const userIdCon = document.getElementById("userId");
const cardCon = document.getElementById("cardCon");
const BASE_URL = "https://b14-post-default-rtdb.asia-southeast1.firebasedatabase.app/";

const POST_URL = `${BASE_URL}/posts.json`;//this url will be same for post and get as it will always take json database
const submitBtn = document.getElementById('submitBtn');
const updateBtn = document.getElementById('updateBtn');
// const EDIT_URL =`${BASE_URL}/posts/:editId` >> here editId is params

const sweetAlert =(msg,icon)=>{
    sweetAlert.fire({
        title:msg,
        icon:icon,
        timer:2500
    })
}




const templating =(postArr)=>{
    let res= ``;

    postArr.forEach(ele=>{
        res+=`
          
                <div class="card postCard  mb-4" id="${ele.id}">
                    <div class="card-header">
                        <h3 class="m-0">${ele.title}</h3>
                    </div>
                    <div class="card-body">
                        <p class="m-0">${ele.body}</p>
                    </div>
                    <div class="card-footer d-flex justify-content-between">
                        <button class="btn btn-sm btn-primary" onclick="onEdit(this)">Edit</button>
                        <button class="btn btn-sm btn-danger"  onclick="onDelete(this)">Delete</button>
                    </div>
                </div>
            
        `
    })
    cardCon.innerHTML=res;
}

const makeApicall = (methodName,apiUrl,msgBody)=>{
        msgBody = msgBody?JSON.stringify(msgBody):null
        loader.classList.remove('d-none')
   return fetch(apiUrl,{
        method:methodName,
        body:msgBody,
        headers:{
            token:`Token from Local Storage`
        }
    })
    .then(res=>{
        return res.json()
    })
}

const fetchCard = ()=>{
    makeApicall("GET",POST_URL)
    .then(data=>{
        cl(data)
        let postArr = []
        for (const key in data) {
            postArr.unshift({...data[key],id:key});
        }
        templating(postArr);
    })
    .catch(err=>{
        sweetAlert(err,`error`)
    })
    .finally(()=>{
        loader.classList.add('d-none');
    })

}
fetchCard();

const onPost =(eve)=>{
    eve.preventDefault();

    let newObj={
        title:titleCon.value,
        body:contentCon.value.trim(),
        userId:userIdCon.value
    }
    cl(newObj)

    makeApicall("POST",POST_URL,newObj)
        .then(res=>{
            cl(res)

            let card = document.createElement('div');
            card.className='card postCard  mb-4';
            card.id= res.name;
            card.innerHTML = `
                    <div class="card-header">
                        <h3 class="m-0">${newObj.title}</h3>
                    </div>
                    <div class="card-body">
                        <p class="m-0">${newObj.body}</p>
                    </div>
                    <div class="card-footer d-flex justify-content-between">
                        <button class="btn btn-sm btn-primary" onclick="onEdit(this)">Edit</button>
                        <button class="btn btn-sm btn-danger" onclick="onDelete(this)">Delete</button>
                    </div>
            
            
            
            `
            cardCon.prepend(card);

        })
        .catch(err=>{
            sweetAlert(err,'error')
        })
        .finally(()=>{
            loader.classList.add('d-none')
            postForm.reset();
        })
}

const onEdit =(ele)=>{
    let editId = ele.closest('.card').id;
    cl(editId);

    localStorage.setItem("editId",editId)
    let EDIT_URL = `${BASE_URL}/posts/${editId}.json`;

    makeApicall("GET",EDIT_URL)
        .then(res=>{
            cl(res)
            titleCon.value = res.title;
            contentCon.value = res.body;
            userIdCon.value = res.userId
            titleCon.focus();
        })
        .catch(err=>sweetAlert(err,'error'))
        .finally(()=>{
            submitBtn.classList.add('d-none');
            updateBtn.classList.remove('d-none');
            loader.classList.add("d-none");

        })
}

const onUpdate =()=>{
    let updatedId = localStorage.getItem("editId");
    cl(updatedId)

    let updatedObj = {
        title:titleCon.value,
        userId:userIdCon.value,
        body:contentCon.value
    }

    let UPDATE_URL  = `${BASE_URL}/posts/${updatedId}.json`;

    makeApicall("PATCH",UPDATE_URL,updatedObj)
        .then(res=>{
            cl(res)

            let card =[...document.getElementById(updatedId).children];
            card[0].innerHTML = `<h3 class="m-0">${updatedObj.title}</h3>`;
            card[1].innerHTML = `<p class="m-0">${updatedObj.body}</p>`
        })
        .catch(err => sweetAlert(err,`error`))
        .finally(()=>{
            postForm.reset()
            loader.classList.add('d-none');
            submitBtn.classList.remove('d-none');
            updateBtn.classList.add('d-none');
        })
}

const onDelete = (ele) => {
    cl(ele);
    let removeId = ele.closest('.card').id;
    cl(removeId);

    let REMOVE_URL = `${BASE_URL}/posts/${removeId}.json`;

    makeApicall("DELETE", REMOVE_URL)
        .then(res => {
            cl(res);
            // Remove the specific card element
            document.getElementById(removeId).remove();
        })
        .catch(err => sweetAlert(`Error: ${err.message}`, 'error'))
        .finally(() => {
            loader.classList.add('d-none');
        });
};


updateBtn.addEventListener("click",onUpdate)

postForm.addEventListener("submit",onPost)




