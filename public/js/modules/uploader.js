/**
 * Created by owenhong on 2015/12/24.
 *
 */


define(function(require, exports, module) {

    /*
     * TODO dmUploader
     * */
    var $dmuploader = require('dmuploader');

    //返回ajax数据函数处理
    var uploadAjaxSuccess = function (result) {
        var $fileBox = $("#drag-and-drop-zone");
        var $ftpSwitch = $("input[name='ftpSwitch']").prop("checked");

        //隐藏loading
        $("#loadding-box").hide();
        $(".drop-tips").hide();

        //提交时间更新
        var myDate = new Date();
        var $currentDate = myDate.getHours() + ':' + myDate.getMinutes() + ':' + myDate.getSeconds();


        //输出路径处理
        var PathExport = function(pathType){
            var $copyContent = '';
            var $copyContent2 = '';
            var $testUrl = result.testPath;
            var $releaseUrl = result.releasePath;
            var $svnReleaseUrl = result.svnReleasePath;
            var $UserDest = result.destPath;

            var $DestPath = "<div class='logs-box'><h3 class='releasePath'>处理成功列表</h3><div class='logs-text-box'>";
            var $releasePath = "<div class='logs-box'><h3 class='releasePath'>FTP提交成功文件列表</h3><div class='logs-text-box'>";
            var $svnReleasePath = "<div class='logs-box'><h3 class='releasePath'>SVN提交成功文件列表</h3><div class='logs-text-box'>";
            var $testPath = "<div class='logs-box'><h3>预览地址</h3><div class='logs-text-box'>";
            var $versionsSyncFiles = "<div class='logs-box'><h3 style='color:#06c;'>CSS版本控制文件列表</h3><div class='logs-text-box'>";

            var $errorMessage = "<div class='logs-box'><div class='logs-text-box'><p><em style='color:red'>Error log: </em></p>";


            //TODO 批量处理失败文件
            if (result.errorMessage.length > 0) {
                $.unique(result.errorMessage);//去除重复错误
                $.each(result.errorMessage, function (i, value) {
                    var $value = value;
                    if(result.osType =="Windows_NT"){
                        $value = value.replace(/\//g,'\\');
                    }
                    $errorMessage += "<p>"+ $value +"</p>"
                });
            }
            if (result.errorFiles.length > 0) {
                $.each(result.errorFiles, function (i, value) {
                    var $value = value;
                    if(result.osType =="Windows_NT"){
                        $value = value.replace(/\//g,'\\');
                    }

                    $DestPath += '<a  style="color:red" class="local" data-href="' + $UserDest + $value + '">' + $UserDest + $value + '</a>';
                });
            }



            //TODO 批量处理成功文件
            if(result.successFiles.length > 0){
                $.each(result.successFiles, function (i, value) {
                    var $value = value;
                    if(result.osType =="Windows_NT"){
                        $value = value.replace(/\//g,'\\');
                    }

                    //此处由于是提单路径所以引用绝对路径，所以不使用$value
                    $copyContent += $releaseUrl + value + '\n';
                    $copyContent2 += $svnReleaseUrl + value + '\n';

                    $DestPath += '<a  class="local" data-href="' + $UserDest + $value + '">' + $UserDest + $value + '</a>';
                });
            }

            //TODO 版本同步文件输出
            if(result.versionsSyncFiles.length > 0) {
                $.each(result.versionsSyncFiles, function (i, SyncValue) {
                    $versionsSyncFiles += '<a data-href="' + SyncValue + '">' + SyncValue + '</a>';
                });
                $versionsSyncFiles += '</div></div>';
            }else{
                $versionsSyncFiles='';
            }


            //TODO FTP提交路径处理
            if(result.ftpSuccess && result.successFiles.length > 0){
                $.each(result.successFiles, function (i, value) {
                    $releasePath += '<p>'+ $releaseUrl + value + '</p>';
                    $testPath += '<a data-href="' + $testUrl + value + '">' + $testUrl + value + '</a>';
                });
            }

            //TODO SVN提交路径处理
            if(result.svnSwitch && result.svnCommitStatus && $svnReleaseUrl != "") {
                $.each(result.svnSuccessFiles, function (i, value) {
                    $svnReleasePath += '<p>'+ $svnReleaseUrl + value + '</p>';
                });
                $svnReleasePath += '</div><a href="javascript:void(0)" class="copy-btn2"><i class="copy-icon"></i>复制</a><div class="copy-tips"><i class="success-icon"></i>复制成功</div><textarea type="text" class="copy-input2"></textarea></div>'
            }else{
                $svnReleasePath = "";
            }

            //TODO SVN错误路径处理
            if(result.svnCommitStatus !== true) {
                $.each(result.successFiles, function (i, value) {
                    var $value = value;
                    if(result.osType =="Windows_NT"){
                        $value = value.replace(/\//g,'\\');
                    }
                    $errorMessage += "<p><strong style='color:red'>SVN文件提交失败：</strong>"+ $UserDest + $value +"</p>" + result.svnErrorMessage;
                });
            }


            if(pathType =="local"){
                $releasePath ='';
                $testPath = '';
                $DestPath += '</div></div>';
            }else{

                if($releaseUrl !=""){
                    $releasePath += '</div><a href="javascript:void(0)" class="copy-btn"><i class="copy-icon"></i>复制</a><div class="copy-tips"><i class="success-icon"></i>复制成功</div><textarea type="text" class="copy-input"></textarea></div>'

                }else{
                    $releasePath ='';
                }

                if($testUrl == ""){
                    $testPath="";
                }else{
                    $testPath += '</div></div>'
                }

                //如果ftp返回失败，则销毁提单路径和预览地址
                if(result.ftpSuccess === false || $ftpSwitch === false){
                    $releasePath = "";
                    $testPath="";
                }

                //只要有一个不等于空就清空本地路径
                if($ftpSwitch !== false || result.svnSwitch !== false){
                    $DestPath = '';
                }
            }

            //隐藏提示
            $(".drop-tips").hide();


            if(result.errorMessage.length <= 0 && result.svnErrorMessage == ""){
                $errorMessage = "";
            }

            //输出到客户端
            $fileBox.append('<div class="logs-wrap"><p class="time">'+ $currentDate +'</p><div class="logs">'+$testPath+ $releasePath + $svnReleasePath + $DestPath + $versionsSyncFiles + $errorMessage + '</div></div>')

            //输出提单复制路径到input.hidden
            if($releasePath != ""){
                $fileBox.children(".logs-wrap").last().find(".copy-input").val($copyContent);
            }
            if($svnReleasePath != ""){
                $fileBox.children(".logs-wrap").last().find(".copy-input2").val($copyContent2);
            }
        }

        //判断返回状态
        if($ftpSwitch === true || result.svnSwitch === true){
            PathExport("network");
        }else{
            PathExport("local");
        }

    }

    //TODO 初始化拖拽上传组件
    exports.initDmUploader = function(updateCssSprite) {
        var $fileBox = $("#drag-and-drop-zone");
        var $repeatfiles = [];
        var $repeatfilesType = [];

        $fileBox.click(function (event) {
            event.preventDefault();
        });

        $dmuploader(updateCssSprite,$fileBox,{
            url: '/tools/doUploader',
            dataType: 'json',
            allowedTypes: '*',
            onInit: function () {
                console.log('init success!');
            },
            onUploadSuccess: function (id, result) {
                if(result.status === true){
                    //更新上一次上传文件数组
                    $repeatfiles = result.repeatFiles;
                    $repeatfilesType = result.repeatfilesType;

                    //成功函数初始化
                    uploadAjaxSuccess(result);
                }else{
                    alert(result.errorMessage);
                    //hide loading
                    $("#loadding-box").hide();
                    return false;
                }
            },
            onUploadError: function (id, message) {
                $("#loadding-box").hide();
                alert("系统出错，请重启软件！");
            },
            onFileTypeError: function (file) {
                $("#loadding-box").hide();
                alert('请勿上传文件夹!!!!');
            }
        });

        //TODO F5 提交上次上传文件
        var repeatLastfiles = function (event) {
            var $panelBox = $("input[name='panelBox']").val();

            if($panelBox =="0") {
                //我们可以用jQuery的event.timeStamp来标记时间，这样每次的keyup事件都会修改lastTime的值，lastTime必需是全局变量
                lastTime = event.timeStamp;
                setTimeout(function () {
                    //如果时间差为0，也就是你停止输入0.5s之内都没有其它的keyup事件产生，这个时候就可以去请求服务器了
                    if (lastTime - event.timeStamp == 0) {
                        /*
                         在这里可以执行ajax请求
                         */

                        if (event.keyCode == "112") {
                            gui.Shell.openExternal("https://github.com/owen-hong/Maxim-Ui/wiki");
                        }

                        if (event.keyCode == "116" || event.which == 1) {
                            if ($repeatfiles.length > 0) {
                                //获取各个任务的开关
                                var $itemsIndex = $("input[name='itemsIndex']").val();
                                var $ftpSwitch = $("input[name='ftpSwitch']").prop("checked");
                                var $imgSwitch = $("input[name='imgSwitch']:checked").val();
                                var $pxToRemSwitch = $("input[name='pxToRemSwitch']").prop("checked");

                                var formdata = new FormData();
                                formdata.append("filesUrl", $repeatfiles);
                                formdata.append("filesType", $repeatfilesType);
                                formdata.append("ftpSwitch", $ftpSwitch);
                                formdata.append("tinyImgSwitch", $imgSwitch);
                                formdata.append("itemsIndex", $itemsIndex);
                                formdata.append("pxToRemSwitch", $pxToRemSwitch);

                                //显示loading
                                $("#loadding-box").show();

                                // Ajax Submit
                                $.ajax({
                                    url: "/tools/doUploader",
                                    type: "post",
                                    dataType: "json",
                                    data: formdata,
                                    cache: false,
                                    contentType: false,
                                    processData: false,
                                    forceSync: false,
                                    success: function (result) {
                                        if(result.status === true){
                                            //更新上一次上传文件数组
                                            $repeatfiles = result.repeatFiles;
                                            $repeatfilesType = result.repeatfilesType;

                                            //成功函数初始化
                                            uploadAjaxSuccess(result);
                                        }else{
                                            alert(result.errorMessage);
                                            //hide loading
                                            $("#loadding-box").hide();
                                            return false;
                                        }
                                    },
                                    error: function (errMsg) {
                                        $("#loadding-box").hide();
                                        alert("系统出错，请重启软件！");
                                    },
                                    complete: function (xhr, textStatus) {

                                        $("#drag-and-drop-zone").scrollTop($("#drag-and-drop-zone")[0].scrollHeight);

                                    }
                                });
                            }
                        }
                    }
                }, 300);
            }
        };


        $("body").keyup(function (event) {
            var lastTime;
            repeatLastfiles(event);
        });

        $("#repeatLastfiles").click(function(event){
            var lastTime;
            repeatLastfiles(event);
        });
    };
});