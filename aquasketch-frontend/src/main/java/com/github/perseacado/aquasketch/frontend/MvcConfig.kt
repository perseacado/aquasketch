package com.github.perseacado.aquasketch.frontend

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.KotlinModule
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Configuration
import org.springframework.security.web.method.annotation.AuthenticationPrincipalArgumentResolver
import org.springframework.web.method.support.HandlerMethodArgumentResolver
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter

/**
 * @author Marco Eigletsberger, 08.07.16.
 */
@Configuration
open class MvcConfig : WebMvcConfigurerAdapter() {

    override fun addViewControllers(registry: ViewControllerRegistry?) {
        registry?.apply {
            addViewController("/login").setViewName("login")
            addRedirectViewController("/", "/app")
        }
    }

    override fun addArgumentResolvers(argumentResolvers: MutableList<HandlerMethodArgumentResolver>?) {
        argumentResolvers?.add(AuthenticationPrincipalArgumentResolver())
    }

    @Autowired
    open fun configureObjectMapper(objectMapper: ObjectMapper) {
        objectMapper.registerModule(KotlinModule())
    }
}