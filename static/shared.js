/**
 * Query Functions
 */

const getQueryParam = (param) => {
    const urlParams = new URLSearchParams(window.location.search)
    const paramValue = urlParams.get(param)
    return paramValue ? paramValue : ''
}

// const search = (text, onSuccess, onError) => {
//     $.ajax({
//         type: "POST",
//         url: "/search",                
//         dataType : "json",
//         contentType: "application/json; charset=utf-8",
//         data : JSON.stringify({
//             search: text
//         }),
//         success: (result) => {
//             const data = result["data"]
//             onSuccess && onSuccess(data)
//         },
//         error: function(request, status, error){
//             onError && onError(request, status, error)
//             console.log("Error");
//             console.log(request)
//             console.log(status)
//             console.log(error)
//         }
//     })
// }

/**
 * Confetti Functions
 */

const confetti = (count = 150) => {
    for (var i = 0; i < count; i++) {
        create(i)
    }
}

const create = (i) => {
    const width = Math.random() * 8;
    const height = width * 0.4;
    const colorIdx = Math.ceil(Math.random() * 3);

    let color = "#ea9999ff"

    switch(colorIdx) {
        case 1:
            color = "#f4ccccff";
            break;
        case 2:
            color = "#e06666ff";
            break;
        default:
            color = "#ea9999ff";
    }

    $(`<div class="confetti-${i}"></div>`).css({
        "background-color": color,
        "width": width+"px",
        "height": height+"px",
        "top": -Math.random()*20+"%",
        "left": Math.random()*100+"%",
        "opacity": Math.random()+0.5,
        "transform": "rotate("+Math.random()*360+"deg)",
        "position": "absolute",
    }).appendTo('body')

    drop(i)
}

const drop = (x) => {
    $('.confetti-'+x).animate({
        top: "100%",
        left: "+="+Math.random()*15+"%"
    }, Math.random() * 3000 + 3000, () => {
        reset(x)
    })
}

const reset = (x) => {
    $('.confetti-'+x).animate({
    "top" : -Math.random()*20+"%",
    "left" : "-="+Math.random()*15+"%"
    }, 0, () => {
        drop(x)
    })
}