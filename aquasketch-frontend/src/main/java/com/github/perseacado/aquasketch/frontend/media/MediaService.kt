package com.github.perseacado.aquasketch.frontend.media

import com.github.perseacado.aquasketch.frontend.user.CustomUserDetails

/**
 * @author Marco Eigletsberger, 13.07.16.
 */
interface MediaService {
    fun findById(user: CustomUserDetails, id: String): Media
    fun save(user: CustomUserDetails, data: ByteArray): String
}