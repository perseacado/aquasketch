package com.github.perseacado.aquasketch.frontend.user

import org.springframework.data.repository.CrudRepository

/**
 * @author Marco Eigletsberger, 08.07.16.
 */
interface UserRepository : CrudRepository<User, String> {
    fun findByUsernameAndProvider(username: String?, provider: Provider): User?
}