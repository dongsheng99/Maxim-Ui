/**
 * Created by owenhong on 2015/11/12.
 */

// Load native UI library
var gui = require('nw.gui');
var win = gui.Window.get();

define(function(require, exports, module) {

    var $ = require('jquery');

    //初始化复制功能
    require('Copy')($);

    //加载dmuploader
    require('dmuploader')($);

    //TODO初始化上传组件
    var $dmUploader = require('uploader');
    $dmUploader.initDmUploader();



    //TODO 全局控制
    $("#closeSortware").click(function(){
        win.close();
    });
    $("#enterFullscreen").click(function(){
        win.toggleFullscreen();
    });

    $("#minimize").click(function(){
        win.minimize();
    });



    //TODO 关闭右侧工具栏
    $("#close-btn").click(function(){
        if($(this).parent().hasClass("in")){
            $(this).parent().removeClass("in").animate({"margin-right":"0"},500);
        }else{
            $(this).parent().addClass("in").animate({"margin-right":"-240px"},500);
        }
    });


    //TODO 选择文件夹
    $(".choose-local").on("change", function () {
        var $val = $(this).val();
        $(".local-path").val($val);
    });

    $(".choose-dest").on("change", function () {
        var $val = $(this).val();
        $(".dest-path").val($val);
    });

    //TODO 自定义dest目录
    var $destPathVal = $("#destPath").val();
    if ($destPathVal == "C:\\Dest\\" || $destPathVal == "C:\\Dest") {
        $(".choose-dest").parent().hide();
        $(".dest-path").prop("disabled", true);
    } else {
        $(".choose-dest").parent().show();
        $(".dest-path").prop("disabled", "");
        $("#destPathSwitch").prop("checked", true);
    }


    $("#destPathSwitch").on("change", function () {
        var $val = $(this).prop("checked");

        if ($val) {
            $(".choose-dest").parent().show();
            $(".dest-path").prop("disabled", "");
        } else {
            $(".choose-dest").parent().hide();
            $(".dest-path").prop("disabled", "disabled");
        }
    });


    /*****TODO 初始化雪碧图规则和CSS规则 ******/
    var $spriteNameSwitch = $("input[name='spriteNameSwitch']").prop('checked');
    var $cssNameSwitch = $("input[name='cssNameSwitch']").prop('checked');
    if ($spriteNameSwitch === true) {
        $("input[name='spriteName']").prop("disabled", "");
        $("#changeSpriteKey").show();
    }else{
        $("input[name='spriteName']").prop("disabled", "disabled");
        $("#changeSpriteKey").hide();
    }
    if ($cssNameSwitch === true) {
        $("input[name='cssName']").prop("disabled", "");
        $("#changeCssKey").show();
    }else{
        $("input[name='cssName']").prop("disabled", "disabled");
        $("#changeCssKey").hide();
    }

    //开启关闭状态切换
    $("input[name='spriteNameSwitch']").on("change", function () {
        var $spriteNameSwitch = $(this).prop('checked');
        if ($spriteNameSwitch === true) {
            $("input[name='spriteName']").prop("disabled", "");
            $("#changeSpriteKey").show();
        } else {
            $("input[name='spriteName']").prop("disabled", "disabled");
            $("#changeSpriteKey").hide();
        }
    })
    $("input[name='cssNameSwitch']").on("change", function () {
        var $cssNameSwitch = $(this).prop('checked');
        if ($cssNameSwitch === true) {
            $("input[name='cssName']").prop("disabled", "");
            $("#changeCssKey").show();
        } else {
            $("input[name='cssName']").prop("disabled", "disabled");
            $("#changeCssKey").hide();
        }
    });

    /******************end**********************/

    //TODO 阻止文件拖拽进窗口
    $(window).on('dragover', function (e) {
        e.preventDefault();
        e.originalEvent.dataTransfer.dropEffect = 'none';
    });
    $(window).on('drop', function (e) {
        e.preventDefault();
    });

    //TODO 浏览器打开窗口 超链接
    $("body").on("click", ".drop-files-box .logs-text-box a,#apply-tiny-api", function () {
        var $url = $(this).data("href");
        if (!$url == undefined || !$url == "") {
            gui.Shell.openExternal($url);
        }
    });


    //TODO 清楚logs
    $("#clearLogs").click(function () {
        $("#drag-and-drop-zone").html("");
    });

    //TODO 路径配置
    $(".panel-heading").click(function () {
        $(this).siblings(".panel-collapse").toggleClass("in");
    });

    //TODO 配置信息异步提交
    $(".form-horizontal").submit(function () {
        var $val = $("#destPathSwitch").prop("checked");

        var formdata = new FormData(this);
        $.ajax({
            type: 'post',
            url: 'http://localhost:3030/tools/doConfig',
            data: formdata,
            contentType: false,
            processData: false
        }).done(function (data) {
            if (data.status) {
                alert("保存成功!");
                win.close();
            } else {
                alert("配置信息保存失败！");
                console.log("Updata config data fail!");
                window.location.reload();
            }
        }).fail(function (data) {
            alert(data);
            Window.reload();
        });

        return false;
    });


    //TODO 更新Css Sprite
    var updateCssSprite = function(newConfig,itemsIndex){
        var $itemsIndex = $("input[name='itemsIndex']").val();

        if(newConfig===true) {
            $itemsIndex = itemsIndex;
        }

        $.get("/updateProject?itemsIndex=" + $itemsIndex).done(function(result){

            var data = result.Config;

            newConfig ? newConfig : false;

            if(newConfig===true){
                //新增项目
                $itemsIndex = itemsIndex;

                if(result.status===true){
                    var $li = '<li class="cur"><a href="javascript:void(0);">'+ data.itemsName +'</a><i class="arrow-left"></i></li>';
                    $(".menu-list li").removeClass("cur");
                    $(".menu-list").append($li);
                    $(".itemes-info .text").text(data.itemsName);
                    $("input[name='itemsIndex']").val($itemsIndex);
                }else{
                    return false;
                }
            }else{
                //编辑项目
                if(result.status ===true){
                    $(".menu-list li").eq($itemsIndex).children("a").text(data.itemsName);
                    $(".itemes-info .text").text(data.itemsName);
                }else{
                    $(".menu-list li").eq($itemsIndex).remove();

                    $(".menu-list li").eq($itemsIndex-1).addClass("cur").children("a").text(data.itemsName);
                    $(".itemes-info .text").text(data.itemsName);
                    $("input[name='itemsIndex']").val($itemsIndex-1);
                }
            }


            var $ftpSwitch = data.ftpSwitch;


            if($ftpSwitch == "true"){
                $("#ftpSwitch").prop("checked",true);
            }else{
                $("#ftpSwitch").prop("checked",false);
            }

            var $imgSwitch = data.imgSwitch;
            if($imgSwitch == "youtu"){
                $("input[name='imgSwitch']").eq(0).prop("checked",false);
                $("input[name='imgSwitch']").eq(1).prop("checked",true);
            }else{
                $("input[name='imgSwitch']").eq(0).prop("checked",true);
                $("input[name='imgSwitch']").eq(1).prop("checked",false);
            }


            var $spriteNameSwitch = data.spriteNameSwitch;
            if ($spriteNameSwitch == "true") {
                $("input[name='spriteNameSwitch']").prop("checked",true);
                $("input[name='spriteName']").prop("disabled", "").val(data.spriteName);
                $("#changeSpriteKey").show();
            } else {
                $("input[name='spriteNameSwitch']").prop("checked",false);
                $("input[name='spriteName']").prop("disabled", "disabled").val(data.spriteName);
                $("#changeSpriteKey").hide();
            }

            var $cssNameSwitch = data.cssNameSwitch;
            if ($cssNameSwitch == "true") {
                $("input[name='cssNameSwitch']").prop("checked",true);
                $("input[name='cssName']").prop("disabled", "").val(data.cssName);

                $("#changeCssKey").show();
            } else {
                $("input[name='cssNameSwitch']").prop("checked",false);
                $("input[name='cssName']").prop("disabled", "disabled").val(data.cssName);
                $("#changeCssKey").hide();
            }

        });
    }

    //TODO 切换项目
    $("body").on("click",".menu-list li",function(){
        var $index = $(this).index();
        var $title = $(this).children("a").text();

        $(this).addClass("cur").siblings().removeClass("cur");
        $("input[name='itemsIndex']").val($index);
        $(".itemes-info .text").text($title);

        $("#drag-and-drop-zone").html("").append('<em class="drop-tips">请拖拽文件到此区域</em>');
        $(".drop-tips").show();
        //更新界面
        updateCssSprite(false);
    });


    //更新css 和 sprite 版本号和状态
    var ajaxCssSprite = function(){
        var $index = $("input[name='itemsIndex']").val();

        var $spriteNameSwitch = $("input[name='spriteNameSwitch']").prop("checked");
        var $spriteName = $("input[name='spriteName']").val();

        var $cssNameSwitch = $("input[name='cssNameSwitch']").prop("checked");
        var $cssName = $("input[name='cssName']").val();


        var $ftpSwitch = $("#ftpSwitch").prop("checked");
        var $imgSwitch = $("input[name='imgSwitch']:checked").val();


        $.post("/updateCssSprite",{
            itemsIndex:$index,
            spriteNameSwitch:$spriteNameSwitch,
            spriteName:$spriteName,
            cssNameSwitch:$cssNameSwitch,
            cssName:$cssName,
            ftpSwitch:$ftpSwitch,
            imgSwitch:$imgSwitch
        }).done(function(data){
            //console.log(data);
            console.log('右侧操作栏更新成功!');
        });
    }

    //监听spriteNameSwitch cssNameSwitch
    $("input[name='spriteNameSwitch'],input[name='cssNameSwitch'],input[name='imgSwitch'],#ftpSwitch").on("change",function(){
        ajaxCssSprite();
    });




    //换一个时间戳
    $("#changeSpriteKey").click(function () {
        var $date = Math.round(new Date().getTime() / 1000);
        $("input[name='spriteName']").val($date);
        ajaxCssSprite();
    });
    $("#changeCssKey").click(function () {
        var $date = Math.round(new Date().getTime() / 1000);
        $("input[name='cssName']").val($date);
        ajaxCssSprite();
    });

    //TODO 新增项目
    $("#addProject").click(function(){
        var $menuListSite = $(".menu-list li").size();

        var addProjectWin = gui.Window.open('addProject?itemsIndex=' + $menuListSite,{
            frame:false,
            toolbar:false,
            position: 'center',
            width:600,
            height: 700,
            focus:true
        });

        addProjectWin.on('close', function () {
            this.hide(); // PRETEND TO BE CLOSED ALREADY
            updateCssSprite(true,$menuListSite);
            this.close(true);
        });
    });
    $(".edit-btn").click(function() {
        var $currentItems = $("input[name='itemsIndex']").val();

        var editProjectWin = gui.Window.open('editProject?itemsIndex=' + $currentItems,{
                frame:false,
                toolbar:false,
                position: 'center',
                width:600,
                height: 700,
                focus:true
        });

        editProjectWin.on('close', function () {
            this.hide(); // PRETEND TO BE CLOSED ALREADY
            updateCssSprite(false,$currentItems);
            this.close(true);
        });
    });

    //删除项目
    $("#deletProject").click(function(e){
        e.preventDefault();

        var $currentItems = $("input[name='currentIndex']").val();

        var r = confirm("是否确认删除该项目！")
        if(r==true){
            $.get("/deleteProject?itemsIndex=" + $currentItems).done(function(data){
                console.log("ok delet");
                alert('删除成功！');
                win.close();
            }).fail(function(data){
                alert("删除失败！")
            });
        }
    });


    //TODO 全局设置
    $("#settingBtn").click(function(){
        var globalSetting = gui.Window.open('globalSetting',{
            frame:false,
            toolbar:false,
            position: 'center',
            width:512,
            height: 370,
            focus:true
        });

        globalSetting.on('close', function () {
            this.hide(); // PRETEND TO BE CLOSED ALREADY
            this.close(true);//防止进程没被杀死
        });
    });


    //todo 关闭当前窗口
    $("#cancelWin").click(function(e){
        e.preventDefault();
        win.close();
    });
});











