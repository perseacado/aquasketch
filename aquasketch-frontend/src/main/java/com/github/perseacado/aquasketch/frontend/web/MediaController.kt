package com.github.perseacado.aquasketch.frontend.web

import com.github.perseacado.aquasketch.frontend.media.MediaService
import com.github.perseacado.aquasketch.frontend.user.CustomUserDetails
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.core.io.ByteArrayResource
import org.springframework.http.MediaType
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestMethod
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.multipart.MultipartFile

/**
 * @author Marco Eigletsberger, 13.07.16.
 */
@RestController
@RequestMapping("/api/media")
open class MediaController @Autowired constructor(
    val mediaService: MediaService) {

    @RequestMapping(value = "/{id}",
        method = arrayOf(RequestMethod.GET),
        produces = arrayOf(MediaType.APPLICATION_JSON_VALUE))
    fun findById(@AuthenticationPrincipal user: CustomUserDetails,
                 @PathVariable id: String) =
        mediaService.findById(user, id)

    @RequestMapping(value = "/{id}",
        method = arrayOf(RequestMethod.GET),
        produces = arrayOf(MediaType.IMAGE_PNG_VALUE))
    fun findByIdData(@AuthenticationPrincipal user: CustomUserDetails,
                     @PathVariable id: String) =
        ByteArrayResource(mediaService.findById(user, id).data)

    @RequestMapping(method = arrayOf(RequestMethod.POST))
    fun save(@AuthenticationPrincipal user: CustomUserDetails,
             file: MultipartFile): Map<String, String> =
        mapOf("id" to mediaService.save(user, file.bytes!!))
}