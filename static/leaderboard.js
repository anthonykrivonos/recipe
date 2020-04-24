function getPrettyTime(date) {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    const strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
}

const getPrettyDate = (date) =>{
    const ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(date)
    const mo = new Intl.DateTimeFormat('en', { month: 'short' }).format(date)
    const da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(date)

    return `${mo} ${da}, ${ye} at ${getPrettyTime(date)}`
}

$(document).ready(() => {

    const currentUser = getUserId()
    
    $("#table").html(leaderboard.map((row, i) => `
        <div class="row mt-3 mb-3">
            <div class="col-2">${i + 1}</div>
            <div class="col-2 ${i === 0 ? 'color-red bold' : ''}">${row.score}</div>
            <div class="col-5 ${currentUser === row.user_id ? 'bold' : ''}">${currentUser === row.user_id ? 'Me' : row.user_id}</div>
            <div class="col-3 color-gray">${getPrettyDate(new Date(row.date))}</div>
        </div>
    `).join(''))

})