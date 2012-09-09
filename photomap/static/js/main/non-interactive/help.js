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
function toggleTutorialDesc($topic){
    $desc = $topic.next("p");
    $descriptions = $(".mp-tutorial-subtopic-desc");
    // hide all other descriptions
    $descriptions.not($desc).slideUp(150);
	
    if ($desc.is(":visible")){
	$desc.slideUp(150);
    }
    else{
	$desc.slideDown(300);
    }
};

$(document).ready(function(){

    $(".mp-faq-question").bind('click', function(){
	trigger = $(this);
	toggleFAQAnswers(trigger);
    });
    $(".mp-tutorial-subtopic").bind('click', function(){
	trigger = $(this);
	toggleTutorialDesc(trigger);
    });

});    

