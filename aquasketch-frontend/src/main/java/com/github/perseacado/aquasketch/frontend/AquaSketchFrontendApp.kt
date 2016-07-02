package com.github.perseacado.aquasketch.frontend

import org.springframework.boot.SpringApplication
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.context.annotation.Configuration

/**
 * @author Marco Eigletsberger, 01.07.16.
 */

@Configuration
@SpringBootApplication
open class AquaSketchFrontendApp {

}

fun main(args: Array<String>) {
    SpringApplication.run(AquaSketchFrontendApp::class.java, *args)
}