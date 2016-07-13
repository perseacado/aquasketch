package com.github.perseacado.aquasketch.frontend.media

import org.springframework.data.mongodb.repository.Query
import org.springframework.data.repository.CrudRepository

/**
 * @author Marco Eigletsberger, 13.07.16.
 */
internal interface MediaRepository : CrudRepository<Media, String> {

    @Query("{ 'userId': ?0, 'id': ?1 }")
    fun findById(userId: String, id: String): Media
}