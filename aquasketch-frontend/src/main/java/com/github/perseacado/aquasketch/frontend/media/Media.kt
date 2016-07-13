package com.github.perseacado.aquasketch.frontend.media

import org.springframework.data.mongodb.core.mapping.Document
import java.util.*

/**
 * @author Marco Eigletsberger, 13.07.16.
 */
@Document
class Media {
    var id: String = UUID.randomUUID().toString()
    lateinit var userId: String
    lateinit var data: ByteArray
}