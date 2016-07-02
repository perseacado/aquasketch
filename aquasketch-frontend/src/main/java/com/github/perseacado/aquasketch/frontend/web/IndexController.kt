package com.github.perseacado.aquasketch.frontend.web

import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.RequestMapping

/**
 * @author Marco Eigletsberger, 01.07.16.
 */
@Controller
@RequestMapping("/")
open class IndexController {

    @RequestMapping
    fun index() = "layout"

}