package com.github.perseacado.aquasketch.frontend.sketch

import org.springframework.data.mongodb.repository.Query
import org.springframework.data.repository.CrudRepository

/**
 * @author Marco Eigletsberger, 09.07.16.
 */
interface SketchRepository : CrudRepository<Sketch, String> {

    @Query(value = "{ 'userId': ?0 }", fields = "{ 'id': 1, 'name': 1}")
    fun findByUserId(userId: String): List<SketchInfo>
}