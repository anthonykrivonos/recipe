$(document).ready(() => {
    
    $("#back").click(() => navigate('/browse'))
    $("#learn").click(() => navigate(`/learn/${dishData.id}`))

})