package com.github.perseacado.aquasketch.frontend.user

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.Document
import java.util.*

/**
 * @author Marco Eigletsberger, 08.07.16.
 */
@Document
data class User(
    @Id var id: String = UUID.randomUUID().toString(),
    var username: String? = null,
    var password: String? = null,
    var name: String? = null,
    var provider: Provider = Provider.LOCAL
)