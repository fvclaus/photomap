function toggleFAQAnswers($question){
    $answer = $question.next();
    $answers = $(".mp-faq-answer");
    // hide all other answers
    $answers.not($answer).slideUp(150);
	
    if ($answer.is(":visible")){
	$answer.slideUp(150);
    }
    else{
	$answer.slideDown(300);
    }
};

$(document).ready(function(){

    var $question = $(".mp-faq-question").bind('click', function(){
	trigger = $(this);
	toggleFAQAnswers($question);
    });

});    

