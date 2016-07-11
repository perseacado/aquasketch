package com.github.perseacado.aquasketch.frontend.web

import com.github.perseacado.aquasketch.frontend.sketch.Layer
import com.github.perseacado.aquasketch.frontend.sketch.Sketch
import com.github.perseacado.aquasketch.frontend.sketch.SketchRepository
import com.github.perseacado.aquasketch.frontend.user.CustomUserDetails
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*

/**
 * @author Marco Eigletsberger, 09.07.16.
 */
@RestController
@RequestMapping("/sketches")
open class SketchController @Autowired constructor(
    val sketchRepository: SketchRepository
) {

    @RequestMapping(value = "/new", method = arrayOf(RequestMethod.GET))
    fun createSketch(@AuthenticationPrincipal user: CustomUserDetails) = Sketch().apply {
        var layer = Layer()
        layer.name = "Layer ${layer.id}"
        layers?.add(layer)
        activeLayer = layer.id
        name = "My new sketch"
        sketchRepository.save(this)
    }

    @RequestMapping(method = arrayOf(RequestMethod.GET))
    fun findSketches(@AuthenticationPrincipal user: CustomUserDetails) =
        sketchRepository.findByUserId(user.id)

    @RequestMapping(value = "/{id}", method = arrayOf(RequestMethod.GET))
    fun findById(@AuthenticationPrincipal user: CustomUserDetails,
                 @PathVariable id: String) =
        sketchRepository.findOne(id)

    @RequestMapping(method = arrayOf(RequestMethod.POST))
    fun createSketch(@AuthenticationPrincipal user: CustomUserDetails,
                     @RequestBody sketch: Sketch) {
        sketch.userId = user.id
        sketchRepository.save(sketch)
    }
}