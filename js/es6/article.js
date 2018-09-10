//一般直接写在一个js文件中
layui.use(['layer', 'element'], function() {
	var layer = layui.layer,
		Delement = layui.element; //导航
	const articleUrl = window.location.search.substr(1);
	const channelName = getUrlParams('channelName');
	channelName == "undefined" ? "推荐" : channelName;
	$('#article').attr('src', articleUrl);
	$('.newsKind').html(channelName);

	function getUrlParams(name) {
		var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i"); //定义正则表达式 
		var r = window.location.search.substr(1).match(reg);
		if(r != null) return decodeURI(r[2]);
		return null;
	};
	var userID = Math.floor(Math.random() * 99 + 1); //随机userId请求新闻导航和新闻列表
	/**
	 * 初始化
	 */
	sideLink(); //相关推荐
	/**
	 * 天气
	 */
	axios({
			url: 'http://restapi.amap.com/v3/weather/weatherInfo',
			method: 'get', // 默认是 get9
			params: {
				key: "dfb9a576fbcb2c9a13a65ab736e47004",
				city: "杭州",
				extensions: "base"
			}
		})
		.then(function(res) {
			const data = res.data.lives[0];
			$(".weather").html(`
				<span>${data.city}&nbsp;</span>
				<span>${data.temperature}°&nbsp;</span>
				<span>${data.weather}&nbsp;</span>	
				<span>${data.winddirection}风&nbsp;</span>				
			`);
		})
		.catch(function(error) {
			console.log(error);
		});
	//侧边链接
	function sideLink(type) {
		axios({
				url: '/list/banner/pc',
				method: 'get', // 默认是 get9			  
				baseURL: TJY.baseUrl(2),
			})
			.then(function(res) {
				const data = res.data.data;
				console.log("侧边链接", data);
				let html = "";
				data.map(function(item, index) {
					html += `
						<div class="r r1"><img src="${item.imgUrl}" alt="" /></div>
					`;
				});
				$(".right").html(html);
				$(".r").on("click", function() {
					$("#mask").show();
					$(".content").addClass("maskAni");
					$(".content1").hide();
					$(".content2").show();
				})
			})
			.catch(function(error) {
				console.log(error);
			});
	}
	/**
	 * 相关推荐
	 */
	//		function relevant(){
	//			axios({
	//			  url: '/information/relevant/list/test',
	//			  method: 'get', // 默认是 get9			  
	//			  baseURL:TJY.baseUrl(2),
	//			  params:{
	//			  	device:2,
	//			  	userId:userID,
	//			  }
	//			})
	//			.then(function(res){
	//								function updata(url,channleName){
	//					$("#article").attr("src",url);
	//				}
	//				const data = res.data.data;				
	//				let html = "";
	//				data.map((item,index)=>{
	//					//console.log(item);
	//					html+=`
	//						<li class="newsItem" data-url="${item.obj.url}")>	
	//							<a href="javascript:void(0)">
	//								<div class="lbox">
	//									 <img class="img" src="${item.obj.picUrl}" alt="" />
	//								</div>
	//								<div class="itemInner">
	//										<div class="item-title">
	//											${item.obj.title}
	//										</div>
	//										<div class="footer">
	//											<div class="footer-left">
	//													<a class="avatar" href="javascript:void(0)"><img src="${item.obj.picUrl}" alt="" /></a>
	//													<a class="source" href="javascript:void(0)">${item.obj.author}</a>
	//													<a class="read" href="javascript:void(0)">${item.obj.readCnt}阅读</a>
	//													<a class="time" href="javascript:void(0)">${item.obj.createDate}</a>
	//											</div>
	//										</div>
	//								</div>
	//							</a>
	//						</li>
	//					`;
	//				})
	//				$(".relevantList").html(html);
	//				$(".newsItem").on("click",function(){					
	//					const url = $(this).attr("data-url");
	//					$("#article").attr("src",url);
	//					$('html , body').animate({scrollTop: 0},'slow');
	//					$('.newsKind').html("推荐");
	//				});
	//			})
	//			.catch(function(error){
	//				console.log(error);
	//			});
	//		}
})
//弹出框
var num = Math.random() * 10;
let autoMask = setTimeout(isgetGold, 5000);
var t;

function isgetGold() {
	if(num > 5) {
		mask();
	}
}

function mask(num) {
	$("#mask").show();
	$(".content").addClass("maskAni");
	$(".content2").hide();
	$(".content1").show();
}

$(".content1").on("click",function(event){
	$("#mask").show();
	$(".content").addClass("maskAni");
	$(".content1").hide();
	$(".content2").show();
	event.stopPropagation();//阻止事件冒泡即可
});
$(".content2").on("click",function(event){
	$("#mask").show();
	$(".content").addClass("maskAni");
	$(".content1").hide();
	$(".content2").show();
	event.stopPropagation();//阻止事件冒泡即可
});
function maskHide() {
	$("#mask").hide();
}
$(".close").on("click",function(event){
	$("#mask").hide();
	event.stopPropagation();//阻止事件冒泡即可
});
$(".btn").on("click",function(event){
	$("#mask").hide();
	event.stopPropagation();//阻止事件冒泡即可
});