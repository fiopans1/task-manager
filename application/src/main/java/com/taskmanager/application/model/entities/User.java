package com.taskmanager.application.model.entities;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.util.Collection;
import java.util.Date;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;





/**
 *
 * @author fiopans1
 */

@Entity
@Table(name="USER")
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    private int age;

    private Date creationDate;

    @OneToMany(mappedBy = "user" , cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Task> tasksForUser;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "user_roles",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<RoleOfUser> roles;
    
    @Embedded
    private FullName name;

    public User(){}

    public int getAge() {
        return age;
    }
    public Date getCreationDate() {
        return creationDate;
    }
    public String getEmail() {
        return email;
    }
    public Long getId() {
        return id;
    }
    @Override
    public String getPassword() {
        return password;
    }
    public Set<Task> getTasksForUser() {
        return tasksForUser;
    }
    @Override
    public String getUsername() {
        return username;
    }
    public FullName getName() {
        return name;
    }
    public void setName(FullName name) {
        this.name = name;
    }
    public void setAge(int age) {
        this.age = age;
    }
    public void setCreationDate(Date creationDate) {
        this.creationDate = creationDate;
    }
    public void setEmail(String email) {
        this.email = email;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public void setPassword(String password) {
        this.password = password;
    }
    public void setTasksForUser(Set<Task> tasksForUser) {
        this.tasksForUser = tasksForUser;
    }
    public void setUsername(String username) {
        this.username = username;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        Set<GrantedAuthority> authorities = roles.stream()
            .flatMap(role -> {
                Set<GrantedAuthority> roleAuthorities = role.getAuthorities().stream()
                    .map(authority -> new SimpleGrantedAuthority(authority.getName()))
                    .collect(Collectors.toSet());
                roleAuthorities.add(new SimpleGrantedAuthority("ROLE_" + role.getName()));
                return roleAuthorities.stream();
            })
            .collect(Collectors.toSet());
        return authorities;
    }
    public void setRoles(Set<RoleOfUser> roles) {
        this.roles = roles;
    }
    public Set<RoleOfUser> getRoles() {
        return roles;
    }







}
