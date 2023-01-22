export default {
    login: {
        validation: {
            "必须有": "{{key}}不得为空",
            "最少位数": "{{key}}至少为{{min}}位",
            "位数不对": "{{key}}必须为{{min}}位至{{max}}位",
            "合法邮箱": "邮箱格式不正确",
            "密码位数不对": "密码必须为{{min}}位至{{max}}位",
            "密码成分不对": "密码必须由大小写英文字母、数字组成",
            "验证码位数不对": "验证码必须为4位",
            "验证码成分不对": "验证码必须由大小写英文字母、数字组成",
            "昵称成分不对": "昵称必须由大小写英文字母、数字、中文、●、·、下划线组成"
        }
    }
}