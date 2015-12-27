package de.yannicklem.shoppinglist.core.user.restapi;

import de.yannicklem.shoppinglist.core.user.entity.SLUser;

import lombok.Getter;
import lombok.Setter;

import org.springframework.hateoas.core.Relation;


@Getter
@Setter
@Relation(collectionRelation = "sLUsers")
public class SLUserDetailed extends SLUser {

    private String username;

    private String firstName;

    private String lastName;

    private String email;

    public SLUserDetailed(SLUser slUser) {

        this.username = slUser.getUsername();
        this.firstName = slUser.getFirstName();
        this.lastName = slUser.getLastName();
        this.email = slUser.getEmail();
    }
}
