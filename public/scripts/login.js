window.addEventListener("load", () => {
    let submit = document.querySelector(".submit-btn");
    
    if(submit) {
        submit.addEventListener("click", () => {
            setTimeout(() => {
                submit.disabled = true;
            }, 0);
        })
    }
})
