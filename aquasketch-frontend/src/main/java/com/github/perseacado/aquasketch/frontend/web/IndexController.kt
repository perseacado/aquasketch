package com.github.perseacado.aquasketch.frontend.web

import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.RequestMapping
import java.security.Principal

/**
 * @author Marco Eigletsberger, 01.07.16.
 */
@Controller
@RequestMapping("/")
open class IndexController {

    @RequestMapping("/app")
    fun app(principal: Principal): String {
        println(principal)
        return "layout"
    }
}