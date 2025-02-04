var re_weburl = new RegExp(/^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!10(?:\.\d{1,3}){3})(?!127(?:\.\d{1,3}){3})(?!169\.254(?:\.\d{1,3}){2})(?!192\.168(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/i );
//fgnass.github.com/spin.js#v1.2.5
(function(a,b,c){function g(a,c){var d=b.createElement(a||"div"),e;for(e in c)d[e]=c[e];return d}function h(a){for(var b=1,c=arguments.length;b<c;b++)a.appendChild(arguments[b]);return a}function j(a,b,c,d){var g=["opacity",b,~~(a*100),c,d].join("-"),h=.01+c/d*100,j=Math.max(1-(1-a)/b*(100-h),a),k=f.substring(0,f.indexOf("Animation")).toLowerCase(),l=k&&"-"+k+"-"||"";return e[g]||(i.insertRule("@"+l+"keyframes "+g+"{"+"0%{opacity:"+j+"}"+h+"%{opacity:"+a+"}"+(h+.01)+"%{opacity:1}"+(h+b)%100+"%{opacity:"+a+"}"+"100%{opacity:"+j+"}"+"}",0),e[g]=1),g}function k(a,b){var e=a.style,f,g;if(e[b]!==c)return b;b=b.charAt(0).toUpperCase()+b.slice(1);for(g=0;g<d.length;g++){f=d[g]+b;if(e[f]!==c)return f}}function l(a,b){for(var c in b)a.style[k(a,c)||c]=b[c];return a}function m(a){for(var b=1;b<arguments.length;b++){var d=arguments[b];for(var e in d)a[e]===c&&(a[e]=d[e])}return a}function n(a){var b={x:a.offsetLeft,y:a.offsetTop};while(a=a.offsetParent)b.x+=a.offsetLeft,b.y+=a.offsetTop;return b}var d=["webkit","Moz","ms","O"],e={},f,i=function(){var a=g("style");return h(b.getElementsByTagName("head")[0],a),a.sheet||a.styleSheet}(),o={lines:12,length:7,width:5,radius:10,rotate:0,color:"#000",speed:1,trail:100,opacity:.25,fps:20,zIndex:2e9,className:"spinner",top:"auto",left:"auto"},p=function q(a){if(!this.spin)return new q(a);this.opts=m(a||{},q.defaults,o)};p.defaults={},m(p.prototype,{spin:function(a){this.stop();var b=this,c=b.opts,d=b.el=l(g(0,{className:c.className}),{position:"relative",zIndex:c.zIndex}),e=c.radius+c.length+c.width,h,i;a&&(a.insertBefore(d,a.firstChild||null),i=n(a),h=n(d),l(d,{left:(c.left=="auto"?i.x-h.x+(a.offsetWidth>>1):c.left+e)+"px",top:(c.top=="auto"?i.y-h.y+(a.offsetHeight>>1):c.top+e)+"px"})),d.setAttribute("aria-role","progressbar"),b.lines(d,b.opts);if(!f){var j=0,k=c.fps,m=k/c.speed,o=(1-c.opacity)/(m*c.trail/100),p=m/c.lines;!function q(){j++;for(var a=c.lines;a;a--){var e=Math.max(1-(j+a*p)%m*o,c.opacity);b.opacity(d,c.lines-a,e,c)}b.timeout=b.el&&setTimeout(q,~~(1e3/k))}()}return b},stop:function(){var a=this.el;return a&&(clearTimeout(this.timeout),a.parentNode&&a.parentNode.removeChild(a),this.el=c),this},lines:function(a,b){function e(a,d){return l(g(),{position:"absolute",width:b.length+b.width+"px",height:b.width+"px",background:a,boxShadow:d,transformOrigin:"left",transform:"rotate("+~~(360/b.lines*c+b.rotate)+"deg) translate("+b.radius+"px"+",0)",borderRadius:(b.width>>1)+"px"})}var c=0,d;for(;c<b.lines;c++)d=l(g(),{position:"absolute",top:1+~(b.width/2)+"px",transform:b.hwaccel?"translate3d(0,0,0)":"",opacity:b.opacity,animation:f&&j(b.opacity,b.trail,c,b.lines)+" "+1/b.speed+"s linear infinite"}),b.shadow&&h(d,l(e("#000","0 0 4px #000"),{top:"2px"})),h(a,h(d,e(b.color,"0 0 1px rgba(0,0,0,.1)")));return a},opacity:function(a,b,c){b<a.childNodes.length&&(a.childNodes[b].style.opacity=c)}}),!function(){function a(a,b){return g("<"+a+' xmlns="urn:schemas-microsoft.com:vml" class="spin-vml">',b)}var b=l(g("group"),{behavior:"url(#default#VML)"});!k(b,"transform")&&b.adj?(i.addRule(".spin-vml","behavior:url(#default#VML)"),p.prototype.lines=function(b,c){function f(){return l(a("group",{coordsize:e+" "+e,coordorigin:-d+" "+ -d}),{width:e,height:e})}function k(b,e,g){h(i,h(l(f(),{rotation:360/c.lines*b+"deg",left:~~e}),h(l(a("roundrect",{arcsize:1}),{width:d,height:c.width,left:c.radius,top:-c.width>>1,filter:g}),a("fill",{color:c.color,opacity:c.opacity}),a("stroke",{opacity:0}))))}var d=c.length+c.width,e=2*d,g=-(c.width+c.length)*2+"px",i=l(f(),{position:"absolute",top:g,left:g}),j;if(c.shadow)for(j=1;j<=c.lines;j++)k(j,-2,"progid:DXImageTransform.Microsoft.Blur(pixelradius=2,makeshadow=1,shadowopacity=.3)");for(j=1;j<=c.lines;j++)k(j);return h(b,i)},p.prototype.opacity=function(a,b,c,d){var e=a.firstChild;d=d.shadow&&d.lines||0,e&&b+d<e.childNodes.length&&(e=e.childNodes[b+d],e=e&&e.firstChild,e=e&&e.firstChild,e&&(e.opacity=c))}):f=k(b,"animation")}(),a.Spinner=p})(window,document);
mixpanel.track_forms("#prepare-form", "#url-lookup","#confirm-email");

function isValidEmailAddress(emailAddress) {
  var pattern = new RegExp(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i);
  return pattern.test(emailAddress);
};

$('input[name="email"]').blur(function(e) {
  mixpanel.name_tag($(this).val());
  mixpanel.track('Entered Email', {'email': $(this).val() });
});

$('input[name="email"]').keyup(function(e) {
  if (isValidEmailAddress($(this).val())) {
    console.log("valid");
    $(this).siblings('input[type=submit]').removeClass("disabled btn-danger").addClass("btn-success");;
  }else{
    $(this).siblings('input[type=submit]').addClass("disabled btn-danger").removeClass("btn-success");
  };
});

$('#free_submit').click(function(e){
  e.preventDefault();
  var email = $('input[name="email"]');
   if (isValidEmailAddress(email.val())) {
     $(this).closest("form").submit();
   }
  
});
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
  var check_http = /^https?:\/\//;
  if (!check_http.test($("input:first").val())) {
    var val = $("input:first").val();
    $("input:first").val("http://" + val);
  }
  if (re_weburl.test($("input:first").val())) {
    mixpanel.track('Valid URL',{'url': $("input:first").val()});
    this.submit();
    $("#status").show();
    return true;
  }else{
    mixpanel.track('Invalid URL',{'url': $("input:first").val()});
    return false;

  }
});

$(".catch").click(function(e) {
  if (!window.pdfthisdomain){
    e.preventDefault();
    window.pdfthisdomain = true;
    $.post("/store", $("form#prepare-form").serializeArray(), function(data){
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
    $('<div class="modal fade" ><img src=' + href + '/></div>').modal();  
    $(this).replaceWith("");
  });

  $('.to_prevew_modal').click(function(e) {
    e.preventDefault();
    e.stopPropagation();
    console.log(this)
    var href = $(this).attr('href');
    $('<div class="modal fade" ><img src=' + href + '/></div>').modal();
    mixpanel.track('Viewed Example', { 'mp_note': href, });
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


  $("div.url").click(function(e) {

    var $checkbox = $(this).find("input.urls");
    mixpanel.track('Selected Url', {'mp_note': "Did not use checkbox", "Url": $checkbox.val() });
    $checkbox.attr('checked', !$checkbox.attr('checked'));
    updateView();
  });

  updateView();
