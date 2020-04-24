const onQuiz = () => {
    let quizIds = getLearnedRecipes().slice()

    if (quizIds.length < 3) {
        showAlert('Are you sure?' , 'We recommend learning at least 3 recipes before proceeding to the quiz.', 'Quiz Me', 'Back', () => {
            while (quizIds.length < 3) {
                const item = Math.floor(Math.random() * count)
                if (!quizIds.includes(item)) {
                    quizIds.push(item)
                }
            }
            shuffle(quizIds)
            quizIds = quizIds.join(',')
            navigate(`/quiz/${quizIds}`)
        })
    } else {
        shuffle(quizIds)
        quizIds = quizIds.slice(0, 3).join(',')
        navigate(`/quiz/${quizIds}`)
    }
}

$(document).ready(function(){

    $(".browse-button").click(() => navigate('/browse'))

    $(".quiz-button").click(onQuiz)

    // Make sure the user is always "logged in"
    setUserId()

})