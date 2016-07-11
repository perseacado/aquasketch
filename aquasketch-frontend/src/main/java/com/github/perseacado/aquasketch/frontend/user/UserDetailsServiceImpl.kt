package com.github.perseacado.aquasketch.frontend.user

import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.stereotype.Service

/**
 * @author Marco Eigletsberger, 08.07.16.
 */
@Service
open class UserDetailsServiceImpl @Autowired constructor(
    val userRepository: UserRepository
) : UserDetailsService {
    override fun loadUserByUsername(username: String?): UserDetails? {
        val user = userRepository.findByUsernameAndProvider(username, Provider.LOCAL)
        if (user == null) {
            throw BadCredentialsException(username)
        }
        return CustomUserDetails(
            user.id,
            user.username,
            mutableListOf(SimpleGrantedAuthority("USER"))
        )
    }
}