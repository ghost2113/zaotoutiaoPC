//一般直接写在一个js文件中
layui.use(['layer' , 'element','carousel'],function(){
var layer = layui.layer,
    Delement = layui.element,//导航
    carousel = layui.carousel;//轮播
var channelId = "youlike";//新闻导航
var channelName = "推荐";
var userID = Math.floor(Math.random()*99+1);//随机userId请求新闻导航和新闻列表
	carousel.render({
	    elem: '#banner'
	    ,width: '100%' //设置容器宽度
	    ,arrow: 'none' //始终显示箭头
	    ,anim: 'fade' //切换动画方式
	    ,autoplay:'true'
	    ,interval:1500
	    ,indicator:'inside'
	});
var loadTime;//文章加载时间
var baseTime = 0;//递增时间
var initTime = new Date().getTime();//初始化时间
var readLocation = true;//是否显示阅读位置刷新
/**
 * 初始化加载
 */
topNews();//顶部新闻
sideLink();//侧边链接
banner(true);//banner轮播热门推荐
/**
 * 天气
 */
axios({
  url: 'http://restapi.amap.com/v3/weather/weatherInfo' ,
  method: 'get', // 默认是 get9
  params:{
	key: "dfb9a576fbcb2c9a13a65ab736e47004",
	city: "杭州",
	extensions: "base"
  }
})
.then(function(res){
	const data = res.data.lives[0];
	$(".weather").html(`
		<span>${data.city}&nbsp;</span>
		<span>${data.temperature}°&nbsp;</span>
		<span>${data.weather}&nbsp;</span>	
		<span>${data.winddirection}风&nbsp;</span>
		
	`);
})
.catch(function(error){
	console.log(error);
});
/**
 * 新闻导航(选项卡)
*/
axios({
  url: '/news/channels' ,
  method: 'get', // 默认是 get9			  
  baseURL:TJY.baseUrl(2),
})
.then(function(res){
	const data = res.data.data;
	//console.log("选项卡",data);
	let html1 = "";
	let html2 = "";
	let more = `<li class="kindItem more">更多
					<ul class="moreKind">											
					</ul>
				</li>`;
	data.map((item,index)=>{
		if(index<7){
			html1+=`<li class="kindItem" data-channelId="${item.channelId}" data-channelName="${item.name}" >${item.name}</li>`;	
		}else{
			html2+=`<li class="kindItem" data-channelId="${item.channelId}" data-channelName="${item.name}">${item.name}</li>`;	
		}								
	})
	$(".newsKind").append(html1+more);
	$(".moreKind").append(html2);
	//更多
	$(".more").hover(function(){
	    $(".moreKind").toggle("fast");		    
	})
	$(".kindItem").on("click",{tab:"tab"},newsKind);
	$(".kindItem").eq(0).trigger("click");
})
.catch(function(error){
	console.log(error);
});
/**
 * 
 * @param {Object} event 新闻导航事件
 */
function newsKind(event){	
	//如果选项卡首次加载清空newsKind,下滑加载不清除
	if(event.data.tab=="tab"){
		$(".location").hide();
		topNews();		
		baseTime = 0;
		$(".newsList").html("");
		channelId = $(this).attr("data-channelId");
		channelName = $(this).attr("data-channelName");
		$(this).addClass('kindItem-active').siblings().removeClass("kindItem-active");
		$(".newsList").attr("data-channelId",channelId)	
		$('html , body').animate({scrollTop: 0},'fast');
		readLocation = true;
	}else{
		channelId = $(".newsList").attr("data-channelId")
		readLocation = false;
	}
	if(channelId=="youlike"){
		banner(true);
	}else{
		banner(false);
	}
	newsCon("tab");
}
/**
 * newsCon 新闻列表
 */
function newsCon(type){	
	$('#newsScroll').dropload({   	
        scrollArea :window,
        loadDownFn : function(me){ 
        	$(".dropload").show();
            $.ajax({
                type: "GET",
                url: TJY.baseUrl(2)+"/information/list/test",
                dataType: 'json',
                data:{
                	c:channelId,
				  	device:2,
				  	userId:userID
                },
                success: function(res){                 	
                	let html = "";
                    if(res.result.status=="success"){  
                    	const data = res.data;	
                    	//console.log("新闻列表",data);
                    	loadTime = baseTime;
						data.map((item,index)=>{
							let showTime = (loadTime + Math.floor(Math.random()*180+1))*1000;//文章显示时间（载入时间+递增+随机时间）				
							html+=`
								<li class="newsItem">
									<a class="visited" href="./article
.html?${item.obj.url}&channelName=`+escape(channelName)+'"'+` target="_blank">
									<div class="lbox">
										 <img class="img" src="${item.obj.picUrl}" alt="" />
									</div>
									<div class="itemInner">
											<div class="item-title">
												${item.obj.title}
											</div>
											<div class="footer">
												<div class="footer-left">
														<a class="avatar" href="#"><img src="${item.obj.picUrl}" alt="" /></a>
														<a class="source" href="#">${item.obj.author}</a>
														<a class="read" href="#">${item.obj.readCnt}阅读</a>
														<a class="time" href="#" data-loadTime="${showTime}">${showTime}</a>
												</div>
											</div>
									</div>
									</a>
								</li>
							`;
						})
                    // 如果没有数据
                    }else{
                		// 锁定
                        me.lock();
                		// 无数据
                    	me.noData();   
                    }
                    if(readLocation){
                    	setTimeout(function(){
                    		$(".location").show();
                    	},2000);                    	
                    	readLocation = false;
                    }else{
                    	 tip();
                    }
                    $(".newsList").append(html);
                    $(".location").on("click",function(){
                    	$('html , body').animate({scrollTop: 0},'fast');
                    });
                    baseTime+=300;
                     //阅读时间
                    updataTime();
                    $(".dropload-down").remove();
                    $(".dropload").hide();                                      
                    // 每次数据插入，必须重置
                    me.resetload();
                },
                error: function(xhr, type){
                    //alert('Ajax error!');
                    // 即使加载出错，也得重置
                    me.resetload();
                }
            });
        }
    });
}
//侧边链接
function sideLink(type){ 	
	axios({
	  url: '/list/banner/pc',
	  method: 'get', // 默认是 get9			  
	  baseURL:TJY.baseUrl(2),
	})
	.then(function(res){
		const data = res.data.data;
		//console.log("侧边链接",data);
		let html= "";
		data.map(function(item,index){
			html+=`
				<div class="r r1"><img src="${item.imgUrl}" alt="" /></div>
			`;
		});
		$(".right").html(html);
		$(".r").on("click",function(){
			$("#mask").show();
			$(".content").addClass("maskAni");
			$(".content1").hide();
			$(".content2").show();
		})
	})
	.catch(function(error){
		console.log(error);
	});
}
 //banner轮播(热门推荐)
function banner(isShow){
   	if(isShow){
   		$("#banner").show(); 		 	
		axios({
		  url: 'getHotToday',
		  method: 'get', // 默认是 get9			  
		  baseURL:TJY.baseUrl(2),
		})
		.then(function(res){
			const data = res.data.data;
			//console.log("轮播",data)
			let html= "";
			data.map(function(item,index){
				html+=`
					<div>
			  			<a href="./article.html?${item.url}&channelName=${escape(channelName)}" target="_blank" style="background-image:url(${item.imgUrl})">
				  			<div style="height:250px;"></div>
				  			<p class="page1">${item.title}</p>
			  			</a>
			  		</div>
				`;
			});
			$("#bannerC").html(html);
			  carousel.render({
			    elem: '#banner'
			    ,width: '100%' //设置容器宽度
			    ,arrow: 'none' //始终显示箭头
			    ,anim: 'fade' //切换动画方式
			    ,autoplay:'true'
			    ,interval:1500
			    ,indicator:'inside'
			  });
			
		})
		.catch(function(error){
			console.log(error);
		});
   	}else{
   		$("#banner").hide();
   	};
}
//头部新闻
function topNews(){
	$.ajax({
        type: "GET",
        url: TJY.baseUrl(2)+"/information/list/test",
        dataType: 'json',
        data:{
        	c:channelId,
		  	device:2,
		  	userId:Math.floor(Math.random()*99+1)
        },
        success: function(res){    
        	//console.log("置顶新闻",res);
        	let html = "";
            if(res.result.status=="success"){  
            	const data = res.data;		
				data.map((item,index)=>{
					let showTime = Math.floor(Math.random()*60+1)*1000;//文章显示时间（载入时间+递增+随机时间）				
					html+=`
								<li class="newsItem">
									<a class="visited" href="./article
.html?${item.obj.url}&channelName=`+escape(channelName)+'"'+` target="_blank">
							<div class="lbox">
								 <img class="img" src="${item.obj.picUrl}" alt="" />
							</div>
							<div class="itemInner">
									<div class="item-title">
										${item.obj.title}
									</div>
									<div class="footer">
										<div class="footer-left">
												<a class="avatar" href="#"><img src="${item.obj.picUrl}" alt="" /></a>
												<a class="source" href="#">${item.obj.author}</a>
												<a class="read" href="#">${item.obj.readCnt}阅读</a>
												<a class="time topTime" href="#" data-loadTime="${showTime}">${countdown(showTime)}</a>
										</div>
									</div>
							</div>
							</a>
						</li>
					`;
				})
            }
            //阅读时间
            $(".hotList").html(html);
            $(".topTime").map(function(index,item){                    	
	        	let lefTime = parseInt(item.dataset.loadtime);
	        	let showTime = countdown(lefTime);
	        	item.innerHTML = showTime;
	       })	          
           tip();   
        },
        error: function(xhr, type){
            //alert('Ajax error!');
            // 即使加载出错，也得重置
        }
    });
}
//更新tip
 function tip(len=10){
 	// 插入数据到页面，放到最后面
 	$(".updata").html(`为你更新了${len}篇文章`);
    $(".updata").stop().animate({height:30},500); 
    setTimeout(function(){
    	$(".updata").stop().animate({height:0},500);
    	$(".updata").html(``);
    },1500);       
 }
 //刷新新闻
 $(".location").on("click",function(){
	topNews();
 	$('html , body').animate({scrollTop: 0},'fast');
 });
 $(".updataHot").on("click",function(){
	topNews();
 	$('html , body').animate({scrollTop: 0},'fast');
 });
  //回到顶部
 $(".top").on("click",function(){
 	$('html , body').animate({scrollTop: 0},'fast');
 });
	/**
	 * 时间计时
	 */
	function countdown(leftTime){		
		//console.log(leftTime);
		var d,h,m,s; 
		var showTime;
        if(leftTime>=0){  
             d = Math.floor(leftTime/1000/60/60/24);  
             h = Math.floor(leftTime/1000/60/60%24);  
             m = Math.floor(leftTime/1000/60%60);  
             s = Math.floor(leftTime/1000%60);                     
        }  
		//将倒计时赋值到div中  				
		//console.log(`${h}:${m}:${s}`);
		if(m!=0&&h===0){
			if(m=="undefiend"){showTime = "刚刚";}
			showTime = m+"分钟前";
		}else if(m===0){
			if(s=="undefiend"){showTime = "刚刚";}
			//showTime = s+"秒前";
			 showTime = "刚刚";
		}else if(h!=0){	
			if(h=="undefiend"){showTime = "刚刚";}
			showTime = h+"小时前";
		}else if(d!=0){
			if(d=="undefiend"){showTime = "刚刚";}
			showTime = d+"天前";
		}
		return showTime;
	};
	/**
	 * 获取时间戳兼容问题
	 */
	function getTs(time){  
	    var arr = time.split(/[- :]/),  
	    _date = new Date(arr[0], arr[1]-1, arr[2], arr[3], arr[4], arr[5]),  
	    timeStr = Date.parse(_date)  
	    return timeStr  
	} 
//	function topTime(){
//		 $(".topTime").map(function(index,item){                    	
//      	let lefTime = parseInt(item.dataset.loadtime);
//      	let showTime = countdown(lefTime);
//      	item.innerHTML = showTime;
//     })		
//	}
	function updataTime(){
		let nowTime = new Date().getTime();
		let timeAdd = nowTime - initTime; 
		//console.log(timeAdd);
		 $(".time").map(function(index,item){                    	
        	let lefTime = parseInt(item.dataset.loadtime) + parseInt(timeAdd);
        	//console.log(lefTime);
        	let showTime = countdown(lefTime);
        	item.innerHTML = showTime;
        })
		
	}
});
//弹出框
let autoMask = setTimeout(mask,5000);
function mask(num){
	$("#mask").show();
	$(".content").addClass("maskAni");
	if(num==2){
		$(".content1").hide();
		$(".content2").show();
	}else{
		$(".content2").hide();
		$(".content1").show();
	}
}
function maskHide(){
	$("#mask").hide();
}	

