

function formatCurrency(num) {
  num = num.toString().replace(/\$|\,/g,'');
  if(isNaN(num))
  num = "0";
  sign = (num == (num = Math.abs(num)));
  num = Math.floor(num*100+0.50000000001);
  cents = num%100;
  num = Math.floor(num/100).toString();
  if(cents<10)
  cents = "0" + cents;
  for (var i = 0; i < Math.floor((num.length-(1+i))/3); i++)
  num = num.substring(0,num.length-(4*i+3))+','+
  num.substring(num.length-(4*i+3));
  return (((sign)?'':'-') + '$' + num + '.' + cents);
}

$("#url-lookup").keyup(function() {
  if (re_weburl.test($("input:first").val())) {
    $("#url-lookup-submit").removeClass("disabled");
    $("#url-lookup-submit").removeClass("btn-danger").addClass("btn-success");
    mixpanel.track('Valid URL',{'url': $("input:first").val()});
  }  else{
    $("#url-lookup-submit").addClass("disabled");
    $("#url-lookup-submit").addClass("btn-danger");
    return false;

  }
})
var timeout = 30;
var opts = {
  lines: 13, // The number of lines to draw
  length: 7, // The length of each line
  width: 4, // The line thickness
  radius: 10, // The radius of the inner circle
  rotate: 0, // The rotation offset
  color: '#000', // #rgb or #rrggbb
  speed: 1, // Rounds per second
  trail: 60, // Afterglow percentage
  shadow: false, // Whether to render a shadow
  hwaccel: false, // Whether to use hardware acceleration
  className: 'spinner', // The CSS class to assign to the spinner
  zIndex: 2e9, // The z-index (defaults to 2000000000)
  top: 'auto', // Top position relative to parent in px
  left: 'auto' // Left position relative to parent in px
};
var target = document.getElementById('status');
var spinner = new Spinner(opts).spin(target);

$("#url-lookup").submit(function(e) {
  e.preventDefault();
  if (re_weburl.test($("input:first").val())) {
    mixpanel.track('URL Look up',{'url': $("input:first").val()});
    this.submit();
    $("#status").show();
    return true;
  }else{
    return false;

  }
});

$(".catch").click(function(e) {
  if (!window.pdfthisdomain) {
    e.preventDefault();
    window.pdfthisdomain = true;
    $.post("/store", $("form#prepare-form").serializeArray(),
     function(data){
       
       console.log(data);
       mixpanel.track('Purchased', {'Amount': $("#cost").text()});
       $("form#prepare-form").submit();
     }, "json");
  };
});

$('.to_modal').click(function(e) {
    
    e.preventDefault();
    e.stopPropagation();
    $(this).button('loading');
    $(this).addClass("disabled")
    var href = $(e.target).attr('href');
    mixpanel.track('Previewed URL', { "Url": href,'mp_note': href, });
    if (href.indexOf('#') == 0) {
        $(href).modal('open');
    } else {
        
            
            $('<div class="modal fade" ><img src=' + href + '/></div>').modal();
       
    }
});
function store_urls() {
  
  var checked = $("input.urls:checked").map(function() {
    return $(this).val();
  })
  
  store.set('urls_to_process', checked.toArray() );
  mixpanel.track('URLS Stored',{'urls_to_process': checked.toArray()});
}

function updateView() {
  var total = $("input.urls:checked").size();
  var limit = 5
  var remaining = limit - total ;
  var cost = (Math.abs(total - limit)) * 0.10;

  if (remaining < 0 ) {
    $("#cost").html(formatCurrency(cost)); 
    $("form#prepare-form").attr( "action", "https://www.paypal.com/cgi-bin/webscr" );
    $(".hide_free").show();
    $(".hide_cost").hide();
  };
  if (remaining >= 0 ) {
    $("#remaining").html(remaining); 
    $("#cost").html("Free!");
    $("form#prepare-form").attr( "action", "/process" )
    $(".hide_free").hide();
    $(".hide_cost").show();
  };
  if (total <= 0 ) {
    $(".hide_cost").hide();
    $(".hide_free").hide();
  }
  $("#purchase_amount").val(total - 3);
  update_url_classes();
  store_urls();
  return remaining;
}

function update_url_classes() {
  $("input.urls").each(function(index) {
    $(this).parents(".alert").toggleClass("alert-danger", !this.checked ).toggleClass("alert-success", this.checked );
  });
}
$("input.urls").click(function(e) {
  updateView();
  mixpanel.track('Selected Url', {'mp_note': "Did not use checkbox", "Url": $(this).val() });
  e.stopPropagation();
});
$("a#purchase").click(function(e) {
  
  $(".catch").click();
});

$("#select-all").click(function(e) {
  mixpanel.track('Select All URLS');
  $('input.urls').attr("checked",!$(this).hasClass("active"));
  updateView();
});

$('input[name="email"]').blur(function(e) {
mixpanel.name_tag($(this).val());
mixpanel.track('Entered Email', {'email': $(this).val() });
});

$("div.url").click(function(e) {

  var $checkbox = $(this).find("input.urls");
  mixpanel.track('Selected Url', {'mp_note': "Did not use checkbox", "Url": $checkbox.val() });
  $checkbox.attr('checked', !$checkbox.attr('checked'));
  updateView();
});

updateView();
