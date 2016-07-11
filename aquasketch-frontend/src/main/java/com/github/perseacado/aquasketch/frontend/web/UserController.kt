package com.github.perseacado.aquasketch.frontend.web

import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

/**
 * @author Marco Eigletsberger, 08.07.16.
 */
@RestController
@RequestMapping("/user")
open class UserController {

    @RequestMapping
    fun me(@AuthenticationPrincipal user: UserDetails) = UserDto(user.username, user.username, user.username)

    data class UserDto(val id: String, val username: String, val name: String)
}