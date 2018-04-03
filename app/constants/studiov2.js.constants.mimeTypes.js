(function(){
  angular
    .module('studio-v2')
    .constant('FILE_EXTENSIONS', {
      types: [
        {
          name: 'Audio', 
          mimetypes: 'audio/*'
        },
        {
          name: 'Code', 
          mimetypes: [
            'text/css', 
            'text/javascript', 
            'text/html'
          ].join(',')
        },
        {
          name: 'Documentos', 
          mimetypes: [
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/rtf',
            'text/plain', 
            'application/xml'
          ].join(',')                  
        },
        {
          name: 'Email', 
          mimetypes: 'application/CDFV2-corrupt'
        },       
         {
          name: 'Imagens', 
          mimetypes: 'image/*'
        },       
        {
          name: 'PDF', 
          mimetypes: 'application/pdf'
        },
         {
          name: 'Planilhas', 
          mimetypes: 'application/vnd.ms-excel'
        },       
        {
          name: 'PowerPoint', 
          mimetypes: [
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'application/vnd.openxmlformats-officedocument.presentationml.slideshow'
          ].join(',')         
        },
        {
          name: 'Video', 
          mimetypes: 'video/*'
        },
        {
          name: 'Zip', 
          mimetypes: [
            'application/x-tar',
            'application/x-compressed',
            'application/zip'
          ].join(',')         
        }
      ],
      extensions: [
        {name: 'aif', mime: 'audio/x-aiff'},
        {name: 'aiff', mime: 'audio/x-aiff'},
        {name: 'asf', mime: 'video/x-ms-asf'},
        {name: 'asx', mime: 'video/x-ms-asx'},
        {name: 'avi', mime: 'video/avi'},
        {name: 'bin', mime: 'application/octet-stream'},
        {name: 'bmp', mime: 'image/bmp'},
        {name: 'bz', mime: 'application/x-bzip'},
        {name: 'bz2', mime: 'application/x-bzip2'},
        {name: 'crt', mime: 'application/x-x509-ca-cert'},
        {name: 'css', mime: 'text/css'},
        {name: 'csv', mime: 'text/plain'},
        {name: 'doc', mime: 'application/msword'},
        {name: 'docx', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'},
        {name: 'dot', mime: 'application/msword'},
        {name: 'dotx', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.template'},
        {name: 'dxf', mime: 'application/dxf'},
        {name: 'eps', mime: 'application/postscript'},
        {name: 'gif', mime: 'image/gif'},
        {name: 'gz', mime: 'application/x-gzip'},
        {name: 'gzip', mime: 'application/x-gzip'},
        {name: 'htm', mime: 'text/html'},
        {name: 'html', mime: 'text/html'},
        {name: 'ico', mime: 'image/x-icon'},
        {name: 'jpg', mime: 'image/jpeg'},
        {name: 'jpe', mime: 'image/jpeg'},
        {name: 'jpeg', mime: 'image/jpeg'},
        {name: 'js', mime: 'text/javascript'},
        {name: 'm4a', mime: 'audio/mp4'},
        {name: 'mov', mime: 'video/quicktime'},
        {name: 'mp3', mime: 'audio/mpeg'},
        {name: 'mp4', mime: 'video/mp4'},
        {name: 'mpeg', mime: 'video/mpeg'},
        {name: 'mpg', mime: 'video/mpeg'},
        {name: 'msg', mime: 'application/CDFV2-corrupt'},
        {name: 'pdf', mime: 'application/pdf'},
        {name: 'php', mime: 'text/plain'},
        {name: 'phps', mime: 'text/plain'},
        {name: 'png', mime: 'image/png'},
        {name: 'pot', mime: 'application/vnd.ms-powerpoint'},
        {name: 'ppa', mime: 'application/vnd.ms-powerpoint'},
        {name: 'pps', mime: 'application/vnd.ms-powerpoint'},
        {name: 'ppt', mime: 'application/vnd.ms-powerpoint'},
        {name: 'pptx', mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation'},
        {name: 'potx', mime: 'application/vnd.openxmlformats-officedocument.presentationml.template'},
        {name: 'ppsx', mime: 'application/vnd.openxmlformats-officedocument.presentationml.slideshow'},
        {name: 'ps', mime: 'application/postscript'},
        {name: 'qt', mime: 'video/quicktime'},
        {name: 'ra', mime: 'audio/x-pn-realaudio'},
        {name: 'ram', mime: 'audio/x-pn-realaudio'},
        {name: 'rtf', mime: 'application/rtf'},
        {name: 'shtml', mime: 'text/html'},
        {name: 'sit', mime: 'application/x-stuffit'},
        {name: 'swf', mime: 'application/x-shockwave-flash'},
        {name: 'sql', mime: 'text/plain'},
        {name: 'tar', mime: 'application/x-tar'},
        {name: 'tgz', mime: 'application/x-compressed'},
        {name: 'tif', mime: 'image/tiff'},
        {name: 'tiff', mime: 'image/tiff'},
        {name: 'txt', mime: 'text/plain'},
        {name: 'wav', mime: 'audio/wav'},
        {name: 'wma', mime: 'audio/x-ms-wma'},
        {name: 'wmf', mime: 'windows/metafile'},
        {name: 'wmv', mime: 'video/x-ms-wmv'},
        {name: 'xls', mime: 'application/vnd.ms-excel'},
        {name: 'xlsx', mime: 'application/vnd.ms-excel'},
        {name: 'xlt', mime: 'application/vnd.ms-excel'},
        {name: 'xltx', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.template'},
        {name: 'xml', mime: 'applications/xml'},
        {name: 'z', mime: 'application/x-compressed'},
        {name: 'zip', mime: 'application/zip'}
      ]
  });
})();

