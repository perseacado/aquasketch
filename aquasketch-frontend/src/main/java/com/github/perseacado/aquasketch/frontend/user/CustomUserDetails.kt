package com.github.perseacado.aquasketch.frontend.user

import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.userdetails.User

/**
 * @author Marco Eigletsberger, 09.07.16.
 */
class CustomUserDetails(
    val id: String,
    username: String?,
    authorities: MutableCollection<out GrantedAuthority>?) : User(username, "N/A", authorities)