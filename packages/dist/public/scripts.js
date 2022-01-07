const sendRequest = () => {
    const contentType = $('#content_type').val();
    const endpoint = $('#endpoint').val();
    const method = $('input:radio[name="method"]:checked').val();
    if(contentType==='JSON'){
        const val = $('#content_json').val();
        try{
            console.log(val);
            const obj = JSON.parse(val);
            $.ajax({
                url: endpoint,
                headers:{
                    'Content-Type': 'application/json'
                },
                method: method,
                data: obj
            }).done((res, status, xhr) => {
                $('#result').html(JSON.stringify(res, null, '  '));
            }).fail((res, status, xhr) => {
                $('#result').html('failed:' + status);
            });

        }catch(error){
            console.log(error);
            $('#result').html(error);
        } 
    }
};

const makeTab = () => {
    $('#emit').on('click',(event)=>{
        console.log('submited');
        sendRequest();
        event.preventDefault();
    });
    $('#body_JSON').hide();
    $('#body_file').hide();
    $('#body_form').hide();
    $('#content_type').on('change', (event)=>{
        switch($('#content_type').val()){
            case 'JSON':
                $('#body_JSON').show();
                $('#body_file').hide();
                $('#body_form').hide();
                break;
            case 'FORM':
                $('#body_JSON').hide();
                $('#body_file').hide();
                $('#body_form').show();
                break;
            case 'MULTI-PART':
                $('#body_JSON').hide();
                $('#body_file').show();
                $('#body_form').hide();
                break;
            default:
                $('#body_JSON').hide();
                $('#body_file').hide();
                $('#body_form').hide();
        }
    });
};


// アプリケーション初期化
$(()=>{
    makeTab();
});
