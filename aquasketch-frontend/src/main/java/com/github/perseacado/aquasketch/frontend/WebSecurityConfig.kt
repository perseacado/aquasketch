package com.github.perseacado.aquasketch.frontend

import com.github.perseacado.aquasketch.frontend.user.CustomUserDetails
import com.github.perseacado.aquasketch.frontend.user.Provider
import com.github.perseacado.aquasketch.frontend.user.User
import com.github.perseacado.aquasketch.frontend.user.UserRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.autoconfigure.security.oauth2.resource.ResourceServerProperties
import org.springframework.boot.autoconfigure.security.oauth2.resource.UserInfoTokenServices
import org.springframework.boot.context.embedded.FilterRegistrationBean
import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.oauth2.client.OAuth2ClientContext
import org.springframework.security.oauth2.client.OAuth2RestTemplate
import org.springframework.security.oauth2.client.filter.OAuth2ClientAuthenticationProcessingFilter
import org.springframework.security.oauth2.client.filter.OAuth2ClientContextFilter
import org.springframework.security.oauth2.client.resource.OAuth2ProtectedResourceDetails
import org.springframework.security.oauth2.client.token.grant.code.AuthorizationCodeResourceDetails
import org.springframework.security.oauth2.config.annotation.web.configuration.EnableOAuth2Client
import org.springframework.security.web.authentication.rememberme.InMemoryTokenRepositoryImpl
import org.springframework.security.web.authentication.rememberme.PersistentTokenRepository
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter
import org.springframework.web.filter.CompositeFilter
import javax.servlet.Filter

/**
 * @author Marco Eigletsberger, 08.07.16.
 */
@Configuration
@EnableOAuth2Client
open class WebSecurityConfig : WebSecurityConfigurerAdapter() {

    @Autowired
    lateinit var oAuth2ClientContext: OAuth2ClientContext

    @Autowired
    lateinit var userDetailsService: UserDetailsService

    @Autowired
    lateinit var userRepository: UserRepository

    override fun configure(http: HttpSecurity?) {
        http?.run {
            csrf()
                .disable()
                .authorizeRequests()
                .antMatchers("/", "/login/*", "/connect/*", "/public/**")
                .permitAll()
                .anyRequest()
                .authenticated()
                .and()
                .formLogin()
                .loginPage("/login")
                .defaultSuccessUrl("/app", true)
                .permitAll()
                .and()
                .rememberMe()
                .rememberMeParameter("remember-me")
                .rememberMeCookieName("remember-me")
                .tokenRepository(tokenRepository())
                .and()
                .logout()
                .permitAll();
            addFilterBefore(ssoFilter(), BasicAuthenticationFilter::class.java)
        }
    }

    open inner class AquaSketchUserInfoTokenServices(val infoUri: String, val clientId: String, val provider: Provider) : UserInfoTokenServices(infoUri, clientId) {
        override fun getPrincipal(map: MutableMap<String, Any>?): Any? {
            val id = super.getPrincipal(map) as String
            var user = userRepository.findByUsernameAndProvider(id, provider)
            if (user == null) {
                user = User(
                    username = id,
                    name = map?.get("name") as String,
                    provider = provider)
                userRepository.save(user)
            }
            return CustomUserDetails(
                user.id,
                user.username,
                mutableListOf(SimpleGrantedAuthority("USER"))
            )
        }
    }

    private fun ssoFilter(): Filter {
        val facebookFilter = OAuth2ClientAuthenticationProcessingFilter("/login/facebook");
        val facebookTemplate = OAuth2RestTemplate(facebook(), oAuth2ClientContext);
        facebookFilter.setRestTemplate(facebookTemplate);
        facebookFilter.setTokenServices(AquaSketchUserInfoTokenServices(facebookResource().getUserInfoUri(), facebook().getClientId(), Provider.FACEBOOK))

        val googleFilter = OAuth2ClientAuthenticationProcessingFilter("/login/google");
        val googleTemplate = OAuth2RestTemplate(google(), oAuth2ClientContext);
        googleFilter.setRestTemplate(googleTemplate);
        googleFilter.setTokenServices(AquaSketchUserInfoTokenServices(googleResource().getUserInfoUri(), google().getClientId(), Provider.GOOGLE));

        val filter = CompositeFilter()
        filter.setFilters(listOf(facebookFilter, googleFilter))
        return filter;
    }

    @Bean
    @ConfigurationProperties("facebook.client")
    open fun facebook(): OAuth2ProtectedResourceDetails {
        return AuthorizationCodeResourceDetails();
    }

    @Bean
    @ConfigurationProperties("facebook.resource")
    open fun facebookResource(): ResourceServerProperties {
        return ResourceServerProperties();
    }

    @Bean
    @ConfigurationProperties("google.client")
    open fun google(): OAuth2ProtectedResourceDetails {
        return AuthorizationCodeResourceDetails();
    }

    @Bean
    @ConfigurationProperties("google.resource")
    open fun googleResource(): ResourceServerProperties {
        return ResourceServerProperties();
    }

    @Bean
    open fun oauth2ClientFilterRegistration(filter: OAuth2ClientContextFilter): FilterRegistrationBean {
        val registration = FilterRegistrationBean();
        registration.setFilter(filter);
        registration.setOrder(-100);
        return registration;
    }

    @Bean
    open fun tokenRepository(): PersistentTokenRepository = InMemoryTokenRepositoryImpl()

    @Autowired
    fun configureGlobal(auth: AuthenticationManagerBuilder) {
        auth.userDetailsService(userDetailsService())
//        auth
//            .inMemoryAuthentication()
//            .withUser("user@example.com").password("password").roles("USER");
    }

    override fun userDetailsService(): UserDetailsService? = userDetailsService
}