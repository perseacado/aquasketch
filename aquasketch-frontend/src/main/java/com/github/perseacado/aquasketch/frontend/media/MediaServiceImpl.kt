package com.github.perseacado.aquasketch.frontend.media

import com.github.perseacado.aquasketch.frontend.user.CustomUserDetails
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service

/**
 * @author Marco Eigletsberger, 13.07.16.
 */
@Service
open internal class MediaServiceImpl @Autowired constructor(
    val mediaRepository: MediaRepository) : MediaService {

    override fun findById(user: CustomUserDetails, id: String)
        = mediaRepository.findById(user.id, id)

    override fun save(user: CustomUserDetails, data: ByteArray): String {
        var media = Media().apply {
            this.data = data
            this.userId = user.id
        }
        mediaRepository.save(media)
        return media.id
    }
}